require('dotenv').config(); 

let express = require('express');
let app = express();
let mongo = require('./datbase/mongo'); 
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const validator = require('validator');
const dns = require('dns');
const Cases = require('./datbase/cases'); // Corrected import
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(cors());

const saltRounds = 10;
const verificationCodes = {};

// ✅ Check for missing JWT_SECRET at startup
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is not set in .env file.");
  process.exit(1); // Exit to prevent insecure behavior
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log("🔐 Received Token:", token);

  if (!token) {
    return res.status(401).json({ status: 401, message: 'Token not found' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ JWT verification error:", err);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 401, message: 'Token expired' });
      }
      return res.status(403).json({ status: 403, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

async function isEmailValid(email) {
  if (!validator.isEmail(email)) return false;
  const domain = email.split('@')[1];
  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      resolve(!err && addresses && addresses.length > 0);
    });
  });
}

async function sendEmail(email, code) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`,
    });
    console.log('📧 Code sent to email:', email);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

app.get('/checklogin', authenticateToken, (req, res) => {
  return res.json({ status: 200, message: "User logged in", user: req.user });
});

app.post('/newcase', authenticateToken, async (req, res) => {
  const { title: caseTitle, type: caseType } = req.body;
  const email = req.user.email;
  

  try {
    // Validate input
    if (!caseTitle || !caseType) {
      return res.status(400).json({
        status: 400,
        message: "Case title and type are required."
      });
    }
    const case_n = new Cases({
      caseTitle,
      caseType,
      email,
    });

    // Ensure user exists before updating the reports
    const user = await mongo.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found."
      });
    }

    
    await mongo.updateOne({ email }, { $push: { reports: caseTitle } });
    await case_n.save();

    return res.status(200).json({
      status: 200,
      message: "Case created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating new case:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to create new case",
      error: error.message, // Include the specific error message
    });
  }
});

app.get('/cases', authenticateToken, async (req, res) => {
  const email = req.user.email;

  try {
    const logeduser = await mongo.findOne({ email });

    if (!logeduser) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    const userReports = logeduser.reports; // Array of case titles

    const cases = await Cases.find({ caseTitle: { $in: userReports } });

    return res.status(200).json({ status: 200, data: cases });
  } catch (err) {
    console.error("❌ Error fetching cases:", err);
    return res.status(500).json({
      status: 500,
      message: 'Error fetching cases',
      error: err.message,
    });
  }
});


app.post('/signup', async (req, res) => {
  const { email, password, confirm_Password } = req.body;

  if (password !== confirm_Password) {
    return res.status(400).json({ status: 400, message: "Passwords do not match" });
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const isValid = await isEmailValid(email);

  if (!isValid) {
    return res.json({ status: 400, message: "Email domain is invalid or does not exist." });
  }

  try {
    const user = await mongo.findOne({ email });
    if (user) {
      return res.json({ status: 400, message: "User already exists" });
    }

    const newUser = new mongo({ email, password: hashedPassword });
    await newUser.save();
    return res.json({ status: 200, message: "User created successfully" });

  } catch (error) {
    console.error('❌ Signup Error:', error);
    return res.json({ status: 500, message: "Failed to signup" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await mongo.findOne({ email });
    if (!user) return res.status(410).json({ status: 410, message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      });

      return res.status(200).json({ status: 200, message: 'Login successful', token });

    } else {
      return res.status(401).json({ status: 401, message: 'Invalid password' });
    }
  } catch (error) {
    console.error("❌ Error finding user:", error);
    return res.status(500).json({ status: 500, message: 'Internal server error' });
  }
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await mongo.findOne({ email });

  if (!user) {
    return res.json({ status: 404, message: "User not found." });
  }

  const resetCode = generateCode();
  verificationCodes[email] = resetCode;
  await sendEmail(email, resetCode);
  res.json({ status: 200, message: "Reset code sent to your email." });
});

app.post('/reset-password', async (req, res) => {
  const { email, resetcode, newpassword, confirmpassword } = req.body;

  if (newpassword !== confirmpassword) {
    return res.status(400).json({ status: 400, message: "Passwords do not match" });
  }

  if (String(verificationCodes[email]) !== String(resetcode)) {
    return res.status(404).json({ status: 404, message: "Code not verified" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
    const updated = await mongo.updateOne(
      { email },
      { $set: { password: hashedPassword } },
      { upsert: false }
    );

    delete verificationCodes[email];

    if (updated.matchedCount === 0) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    if (updated.modifiedCount > 0) {
      return res.status(200).json({ status: 200, message: "Password updated successfully" });
    } else {
      return res.status(500).json({ status: 500, message: "Password update failed or same as old password" });
    }
  } catch (error) {
    console.error("❌ Error updating password:", error);
    return res.status(500).json({ status: 500, message: "Something went wrong" });
  }
});

app.listen(5500, () => {
  console.log('🚀 Server started on port 5500');
});
