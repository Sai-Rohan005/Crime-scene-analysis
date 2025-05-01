// // // // let express=require('express')
// // // // let app=express();
// // // // let mongo=require('./datbase/mongo')
// // // // const cors = require('cors');
// // // // const nodemailer = require('nodemailer');


// // // // app.use(express.json());
// // // // app.use(cors());
// // // // const bcrypt = require('bcrypt');
// // // // const e = require('express');
// // // // const saltRounds = 10;

// // // // const userdetails={
// // // //   "email":null
// // // // }

// // // // function generateCode() {
// // // //   return Math.floor(100000 + Math.random() * 900000); 
// // // // }

// // // // const transporter = nodemailer.createTransport({
// // // //   service: 'gmail', 
// // // //   auth: {
// // // //     user: 'rohantanuku07@gmail.com', 
// // // //     pass: 'kfde bjyy uqjq uwxe'   
// // // // }});


// // // // const dns = require('dns');
// // // // const validator = require('validator');

// // // // async function isEmailValid(email) {
// // // //   if (!validator.isEmail(email)) return false;

// // // //   const domain = email.split('@')[1];

// // // //   return new Promise((resolve) => {
// // // //     dns.resolveMx(domain, (err, addresses) => {
// // // //       if (err || !addresses || addresses.length === 0) {
// // // //         resolve(false);
// // // //       } else {
// // // //         resolve(true);
// // // //       }
// // // //     });
// // // //   });
// // // // }




// // // // async function sendEmail(email, code) {
// // // //   try {
// // // //     await transporter.sendMail({
// // // //       from: 'rohantanuku07@gmail.com',
// // // //       to: email,
// // // //       subject: 'Your Verification Code',
// // // //       text: `Your verification code is: ${code}`
// // // //     });
// // // //     console.log('Code sent to email:', email);
// // // //   } catch (error) {
// // // //     return 'Error sending email:';
// // // //   }
// // // // }

// // // // const emailExistence = require('email-existence');




// // // // app.post('/newcase',(req,res)=>{

// // // // })

// // // // app.post('/login', async (req, res) => {
// // // //   const { email, password } = req.body;

// // // //   try {
// // // //     const user = await mongo.findOne({ email });
// // // //     if (!user) {
// // // //       return res.status(410).json({ status: 410, message: 'User not found' });
// // // //     }

// // // //     const isValid = await bcrypt.compare(password, user.password);
// // // //     if (isValid) {
// // // //       return res.status(200).json({ status: 200, message: 'Login successful' });
// // // //     } else {
// // // //       return res.status(401).json({ status: 401, message: 'Invalid password' });
// // // //     }
// // // //   } catch (error) {
// // // //     console.error("Error finding user:", error);
// // // //     return res.status(500).json({ status: 500, message: 'Internal server error' });
// // // //   }
// // // // });



// // // // app.post('/signup', async (req, res) => {
// // // //   const { email, password, confirm_Password } = req.body;

// // // //   const hashedPassword = await bcrypt.hash(password, saltRounds);

// // // //   const isValid = await isEmailValid(email);
  
// // // //   if (!isValid) {
// // // //     return res.json({ status: 400,message: "Email domain is invalid or does not exist." });
// // // //   }

// // // //   emailExistence.check(email, async function (error, response) {
// // // //     if (error) {
// // // //       console.log(error);
// // // //       return res.json({ status: 500, message: "There was some error in the process." });
// // // //     }
    
// // // //     if (response) {
// // // //       const user = await mongo.findOne({ email });
// // // //       if (user) {
// // // //         return res.json({
// // // //           status: 400,
// // // //           message: "User already exists"
// // // //         });
// // // //       }

// // // //       const newUser = new mongo({
// // // //         email: email,
// // // //         password: hashedPassword
// // // //       });

// // // //       try {
// // // //         await newUser.save();
// // // //         res.json({
// // // //           status: 200,
// // // //           message: "User created successfully"
// // // //         });
// // // //       } catch (error) {
// // // //         console.error(error);
// // // //         res.json({
// // // //           status: 500,
// // // //           message: "Failed to signup"
// // // //         });
// // // //       }
// // // //     } else {
// // // //       res.json({ 
// // // //         status: 404, 
// // // //         message: "Email domain does not exist" 
// // // //       });
// // // //     }
// // // //   });
// // // // });


// // // // let verificationCodes = {}; 

// // // // app.post('/forgot-password', async (req, res) => {
// // // //   const { email } = req.body;
// // // //   const user = await mongo.findOne({ email });

// // // //   if (user) {
// // // //     const resetCode = generateCode();
// // // //     verificationCodes[email] = resetCode; 

    
// // // //     await sendEmail(email, resetCode);

// // // //     res.json({
// // // //       status: 200,
// // // //       message: "Reset code sent to your email.",
// // // //     });
// // // //   } else {
// // // //     res.json({
// // // //       status: 404,
// // // //       message: "User not found.",
// // // //     });
// // // //   }
// // // // });






// // // // app.post('/reset-password', async (req, res) => {
// // // //   const { email, resetcode, newpassword, confirmpassword } = req.body;

// // // //   if (newpassword !== confirmpassword) {
// // // //     return res.status(400).json({
// // // //       status: 400,
// // // //       message: "Passwords do not match",
// // // //     });
// // // //   }

// // // //   if (String(verificationCodes[email]) === String(resetcode)) {
// // // //     try {
// // // //       const hashedPassword = await bcrypt.hash(newpassword, saltRounds);

// // // //       const updated = await mongo.updateOne(
// // // //         { email: email },
// // // //         { $set: { password: hashedPassword } },
// // // //         { upsert: false }
// // // //       );

// // // //       delete verificationCodes[email];

// // // //       if (updated.matchedCount === 0) {
// // // //         return res.status(404).json({
// // // //           status: 404,
// // // //           message: "User not found",
// // // //         });
// // // //       }

// // // //       if (updated.modifiedCount > 0) {
// // // //         return res.status(200).json({
// // // //           status: 200,
// // // //           message: "Password updated successfully",
// // // //         });
// // // //       } else {
// // // //         return res.status(500).json({
// // // //           status: 500,
// // // //           message: "Password update failed or same as old password",
// // // //         });
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("Error updating password:", error);
// // // //       return res.status(500).json({
// // // //         status: 500,
// // // //         message: "Something went wrong",
// // // //       });
// // // //     }
// // // //   } else {
// // // //     return res.status(404).json({
// // // //       status: 404,
// // // //       message: "Code not verified",
// // // //     });
// // // //   }
// // // // });










// // // // app.listen('5500',(e)=>{
// // // //     console.log('Server started on port 5500');
// // // // })

























// // // let express = require('express');
// // // let app = express();
// // // let mongo = require('./datbase/mongo');
// // // const cors = require('cors');
// // // const nodemailer = require('nodemailer');
// // // const bcrypt = require('bcrypt');
// // // const validator = require('validator');
// // // const dns = require('dns');
// // // const {Caseses}=require('./datbase/cases');
// // // const jwt = require('jsonwebtoken');
// // // require('dotenv').config();


// // // app.use(express.json());
// // // app.use(cors());

// // // const saltRounds = 10;
// // // const verificationCodes = {};
// // // function generateCode() {
// // //   return Math.floor(100000 + Math.random() * 900000);
// // // }

// // // const transporter = nodemailer.createTransport({
// // //   service: 'gmail',
// // //   auth: {
// // //     user: 'rohantanuku07@gmail.com',
// // //     pass: 'kfde bjyy uqjq uwxe'
// // //   }
// // // });


// // // function authenticateToken(req, res, next) {
// // //   const authHeader = req.headers['authorization'];
// // //   const token = authHeader && authHeader.split(' ')[1]; // Get token after "Bearer"

// // //   if (!token) return res.status(401).json({ status: 401, message: 'Token not found' });

// // //   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
// // //     if (err) return res.status(403).json({ status: 403, message: 'Invalid token' });
// // //     req.user = user; // attach user data to request
// // //     next();
// // //   });
// // // }


// // // async function isEmailValid(email) {
// // //   if (!validator.isEmail(email)) return false;  
// // //   const domain = email.split('@')[1];  
// // //   return new Promise((resolve) => {
// // //     dns.resolveMx(domain, (err, addresses) => {
// // //       resolve(!err && addresses && addresses.length > 0);
// // //     });
// // //   });
// // // }


// // // async function sendEmail(email, code) {
// // //   try {
// // //     await transporter.sendMail({
// // //       from: 'rohantanuku07@gmail.com',
// // //       to: email,
// // //       subject: 'Your Verification Code',
// // //       text: `Your verification code is: ${code}`
// // //     });
// // //     console.log('Code sent to email:', email);
// // //   } catch (error) {
// // //     console.error('Error sending email:', error);
// // //   }
// // // }
// // // userdetails={}

// // // app.get('/checklogin', authenticateToken, (req, res) => {
// // //   return res.json({ status: 200, message: "User logged in", user: req.user });
// // // });


// // // app.post('/newcase', authenticateToken, async (req, res) => {
// // //   const { title: caseTitle, type: caseType } = req.body;
// // //   const email = req.user.email; // from JWT

// // //   try {
// // //     const case_n = new Caseses({
// // //       caseTitle,
// // //       caseType,
// // //     });

// // //     await mongo.updateOne(
// // //       { email: email },
// // //       { $push: { reports: caseTitle } }
// // //     );

// // //     await case_n.save();

// // //     return res.status(200).json({
// // //       status: 200,
// // //       message: "Case created successfully",
// // //     });
// // //   } catch (error) {
// // //     console.error("Error creating new case:", error);
// // //     return res.status(500).json({
// // //       status: 500,
// // //       message: "Failed to create new case",
// // //     });
// // //   }
// // // });




// // // app.get('/cases', async (req, res) => {
// // //   try {
// // //     const cases = await Caseses.find({});
// // //     return res.json({ status: 200, data: cases });
// // //   } catch (err) {
// // //     return res.status(500).json({ status: 500, message: 'Error fetching cases' });
// // //   }
// // // });


// // // app.post('/signup', async (req, res) => {
// // //   const { email, password, confirm_Password } = req.body;

// // //   if (password !== confirm_Password) {
// // //     return res.status(400).json({ status: 400, message: "Passwords do not match" });
// // //   }

// // //   const hashedPassword = await bcrypt.hash(password, saltRounds);
// // //   const isValid = await isEmailValid(email);

// // //   if (!isValid) {
// // //     return res.json({ status: 400, message: "Email domain is invalid or does not exist." });
// // //   }

// // //   try {
// // //     const user = await mongo.findOne({ email });
// // //     if (user) {
// // //       return res.json({ status: 400, message: "User already exists" });
// // //     }

// // //     const newUser = new mongo({ email, password: hashedPassword });
// // //     await newUser.save();
// // //     return res.json({ status: 200, message: "User created successfully" });

// // //   } catch (error) {
// // //     console.error('Signup Error:', error);
// // //     return res.json({ status: 500, message: "Failed to signup" });
// // //   }
// // // });


// // // app.post('/login', async (req, res) => {
// // //   const { email, password } = req.body;
// // //   try {
// // //     const user = await mongo.findOne({ email });
// // //     if (!user) return res.status(410).json({ status: 410, message: 'User not found' });

// // //     const isValid = await bcrypt.compare(password, user.password);
// // //     if (isValid) {
// // //       const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
// // //         expiresIn: process.env.JWT_EXPIRES_IN || '1d',
// // //       });

// // //       return res.status(200).json({ status: 200, message: 'Login successful', token });
// // //     } else {
// // //       return res.status(401).json({ status: 401, message: 'Invalid password' });
// // //     }
// // //   } catch (error) {
// // //     console.error("Error finding user:", error);
// // //     return res.status(500).json({ status: 500, message: 'Internal server error' });
// // //   }
// // // });



// // // app.post('/forgot-password', async (req, res) => {
// // //   const { email } = req.body;
// // //   const user = await mongo.findOne({ email });

// // //   if (!user) {
// // //     return res.json({ status: 404, message: "User not found." });
// // //   }

// // //   const resetCode = generateCode();
// // //   verificationCodes[email] = resetCode;
// // //   await sendEmail(email, resetCode);
// // //   res.json({ status: 200, message: "Reset code sent to your email." });
// // // });


// // // app.post('/reset-password', async (req, res) => {
// // //   const { email, resetcode, newpassword, confirmpassword } = req.body;

// // //   if (newpassword !== confirmpassword) {
// // //     return res.status(400).json({ status: 400, message: "Passwords do not match" });
// // //   }

// // //   if (String(verificationCodes[email]) !== String(resetcode)) {
// // //     return res.status(404).json({ status: 404, message: "Code not verified" });
// // //   }

// // //   try {
// // //     const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
// // //     const updated = await mongo.updateOne(
// // //       { email },
// // //       { $set: { password: hashedPassword } },
// // //       { upsert: false }
// // //     );

// // //     delete verificationCodes[email];

// // //     if (updated.matchedCount === 0) {
// // //       return res.status(404).json({ status: 404, message: "User not found" });
// // //     }

// // //     if (updated.modifiedCount > 0) {
// // //       return res.status(200).json({ status: 200, message: "Password updated successfully" });
// // //     } else {
// // //       return res.status(500).json({ status: 500, message: "Password update failed or same as old password" });
// // //     }
// // //   } catch (error) {
// // //     console.error("Error updating password:", error);
// // //     return res.status(500).json({ status: 500, message: "Something went wrong" });
// // //   }
// // // });



// // // app.listen(5500, () => {
// // //   console.log('Server started on port 5500');
// // // });














// // // let express = require('express');
// // // let app = express();
// // // let mongo = require('./datbase/mongo');
// // // const cors = require('cors');
// // // const nodemailer = require('nodemailer');
// // // const bcrypt = require('bcrypt');
// // // const validator = require('validator');
// // // const dns = require('dns');
// // // const { Caseses } = require('./datbase/cases');
// // // const jwt = require('jsonwebtoken');
// // // require('dotenv').config();

// // // app.use(express.json());
// // // app.use(cors());

// // // const saltRounds = 10;
// // // const verificationCodes = {};

// // // function generateCode() {
// // //   return Math.random().toString(36).substring(2, 8).toUpperCase();
// // // }

// // // const transporter = nodemailer.createTransport({
// // //   service: 'gmail',
// // //   auth: {
// // //     user: process.env.GMAIL_USER,
// // //     pass: process.env.GMAIL_PASS,
// // //   },
// // // });

// // // // Middleware to authenticate JWT token
// // // function authenticateToken(req, res, next) {
// // //   const authHeader = req.headers['authorization'];
// // //   const token = authHeader && authHeader.split(' ')[1]; // Extract token

// // //   console.log("Received Token:", token);  // Debugging: Log received token

// // //   if (!token) {
// // //     return res.status(401).json({ status: 401, message: 'Token not found' });
// // //   }

// // //   // Verify the token
// // //   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
// // //     if (err) {
// // //       console.error("JWT verification error:", err);  // Log error for debugging
// // //       if (err.name === 'TokenExpiredError') {
// // //         return res.status(401).json({ status: 401, message: 'Token expired' });
// // //       }
// // //       return res.status(403).json({ status: 403, message: 'Invalid token' });
// // //     }
// // //     req.user = user;  // Attach user data to request
// // //     next();
// // //   });
// // // }

// // // async function isEmailValid(email) {
// // //   if (!validator.isEmail(email)) return false;  
// // //   const domain = email.split('@')[1];  
// // //   return new Promise((resolve) => {
// // //     dns.resolveMx(domain, (err, addresses) => {
// // //       resolve(!err && addresses && addresses.length > 0);
// // //     });
// // //   });
// // // }

// // // async function sendEmail(email, code) {
// // //   try {
// // //     await transporter.sendMail({
// // //       from: 'rohantanuku07@gmail.com',
// // //       to: email,
// // //       subject: 'Your Verification Code',
// // //       text: `Your verification code is: ${code}`,
// // //     });
// // //     console.log('Code sent to email:', email);
// // //   } catch (error) {
// // //     console.error('Error sending email:', error);
// // //   }
// // // }

// // // // Routes
// // // app.get('/checklogin', authenticateToken, (req, res) => {
// // //   return res.json({ status: 200, message: "User logged in", user: req.user });
// // // });

// // // app.post('/newcase', authenticateToken, async (req, res) => {
// // //   const { title: caseTitle, type: caseType } = req.body;
// // //   const email = req.user.email;

// // //   try {
// // //     const case_n = new Caseses({
// // //       caseTitle,
// // //       caseType,
// // //     });

// // //     await mongo.updateOne({ email }, { $push: { reports: caseTitle } });
// // //     await case_n.save();

// // //     return res.status(200).json({
// // //       status: 200,
// // //       message: "Case created successfully",
// // //     });
// // //   } catch (error) {
// // //     console.error("Error creating new case:", error);
// // //     return res.status(500).json({
// // //       status: 500,
// // //       message: "Failed to create new case",
// // //     });
// // //   }
// // // });

// // // app.get('/cases', async (req, res) => {
// // //   try {
// // //     const cases = await Caseses.find({});
// // //     return res.json({ status: 200, data: cases });
// // //   } catch (err) {
// // //     return res.status(500).json({ status: 500, message: 'Error fetching cases' });
// // //   }
// // // });

// // // app.post('/signup', async (req, res) => {
// // //   const { email, password, confirm_Password } = req.body;

// // //   if (password !== confirm_Password) {
// // //     return res.status(400).json({ status: 400, message: "Passwords do not match" });
// // //   }

// // //   const hashedPassword = await bcrypt.hash(password, saltRounds);
// // //   const isValid = await isEmailValid(email);

// // //   if (!isValid) {
// // //     return res.json({ status: 400, message: "Email domain is invalid or does not exist." });
// // //   }

// // //   try {
// // //     const user = await mongo.findOne({ email });
// // //     if (user) {
// // //       return res.json({ status: 400, message: "User already exists" });
// // //     }

// // //     const newUser = new mongo({ email, password: hashedPassword });
// // //     await newUser.save();
// // //     return res.json({ status: 200, message: "User created successfully" });

// // //   } catch (error) {
// // //     console.error('Signup Error:', error);
// // //     return res.json({ status: 500, message: "Failed to signup" });
// // //   }
// // // });

// // // app.post('/login', async (req, res) => {
// // //   const { email, password } = req.body;
// // //   try {
// // //     const user = await mongo.findOne({ email });
// // //     if (!user) return res.status(410).json({ status: 410, message: 'User not found' });

// // //     const isValid = await bcrypt.compare(password, user.password);
// // //     if (isValid) {
// // //       const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
// // //         expiresIn: process.env.JWT_EXPIRES_IN || '1d',
// // //       });

// // //       return res.status(200).json({ status: 200, message: 'Login successful', token });

// // //     } else {
// // //       return res.status(401).json({ status: 401, message: 'Invalid password' });
// // //     }
// // //   } catch (error) {
// // //     console.error("Error finding user:", error);
// // //     return res.status(500).json({ status: 500, message: 'Internal server error' });
// // //   }
// // // });

// // // app.post('/forgot-password', async (req, res) => {
// // //   const { email } = req.body;
// // //   const user = await mongo.findOne({ email });

// // //   if (!user) {
// // //     return res.json({ status: 404, message: "User not found." });
// // //   }

// // //   const resetCode = generateCode();
// // //   verificationCodes[email] = resetCode;
// // //   await sendEmail(email, resetCode);
// // //   res.json({ status: 200, message: "Reset code sent to your email." });
// // // });

// // // app.post('/reset-password', async (req, res) => {
// // //   const { email, resetcode, newpassword, confirmpassword } = req.body;

// // //   if (newpassword !== confirmpassword) {
// // //     return res.status(400).json({ status: 400, message: "Passwords do not match" });
// // //   }

// // //   if (String(verificationCodes[email]) !== String(resetcode)) {
// // //     return res.status(404).json({ status: 404, message: "Code not verified" });
// // //   }

// // //   try {
// // //     const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
// // //     const updated = await mongo.updateOne(
// // //       { email },
// // //       { $set: { password: hashedPassword } },
// // //       { upsert: false }
// // //     );

// // //     delete verificationCodes[email];

// // //     if (updated.matchedCount === 0) {
// // //       return res.status(404).json({ status: 404, message: "User not found" });
// // //     }

// // //     if (updated.modifiedCount > 0) {
// // //       return res.status(200).json({ status: 200, message: "Password updated successfully" });
// // //     } else {
// // //       return res.status(500).json({ status: 500, message: "Password update failed or same as old password" });
// // //     }
// // //   } catch (error) {
// // //     console.error("Error updating password:", error);
// // //     return res.status(500).json({ status: 500, message: "Something went wrong" });
// // //   }
// // // });

// // // // Start the server
// // // app.listen(5500, () => {
// // //   console.log('Server started on port 5500');
// // // });














// // require('dotenv').config(); // Must be FIRST

// // let express = require('express');
// // let app = express();
// // let mongo = require('./datbase/mongo');
// // const cors = require('cors');
// // const nodemailer = require('nodemailer');
// // const bcrypt = require('bcrypt');
// // const validator = require('validator');
// // const dns = require('dns');
// // const { Caseses } = require('./datbase/cases');
// // const jwt = require('jsonwebtoken');

// // app.use(express.json());
// // app.use(cors());

// // const saltRounds = 10;
// // const verificationCodes = {};

// // // ✅ Check for missing JWT_SECRET at startup
// // if (!process.env.JWT_SECRET) {
// //   console.error("❌ ERROR: JWT_SECRET is not set in .env file.");
// //   process.exit(1); // Exit to prevent insecure behavior
// // }

// // function generateCode() {
// //   return Math.random().toString(36).substring(2, 8).toUpperCase();
// // }

// // const transporter = nodemailer.createTransport({
// //   service: 'gmail',
// //   auth: {
// //     user: process.env.GMAIL_USER,
// //     pass: process.env.GMAIL_PASS,
// //   },
// // });


// // function authenticateToken(req, res, next) {
// //   const authHeader = req.headers['authorization'];
// //   const token = authHeader && authHeader.split(' ')[1];

// //   console.log("🔐 Received Token:", token);

// //   if (!token) {
// //     return res.status(401).json({ status: 401, message: 'Token not found' });
// //   }

// //   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
// //     if (err) {
// //       console.error("❌ JWT verification error:", err);
// //       if (err.name === 'TokenExpiredError') {
// //         return res.status(401).json({ status: 401, message: 'Token expired' });
// //       }
// //       return res.status(403).json({ status: 403, message: 'Invalid token' });
// //     }
// //     req.user = user;
// //     next();
// //   });
// // }

// // async function isEmailValid(email) {
// //   if (!validator.isEmail(email)) return false;
// //   const domain = email.split('@')[1];
// //   return new Promise((resolve) => {
// //     dns.resolveMx(domain, (err, addresses) => {
// //       resolve(!err && addresses && addresses.length > 0);
// //     });
// //   });
// // }

// // async function sendEmail(email, code) {
// //   try {
// //     await transporter.sendMail({
// //       from: process.env.GMAIL_USER,
// //       to: email,
// //       subject: 'Your Verification Code',
// //       text: `Your verification code is: ${code}`,
// //     });
// //     console.log('📧 Code sent to email:', email);
// //   } catch (error) {
// //     console.error('❌ Error sending email:', error);
// //   }
// // }


// // app.get('/checklogin', authenticateToken, (req, res) => {
// //   return res.json({ status: 200, message: "User logged in", user: req.user });
// // });
// // app.post('/newcase', authenticateToken, async (req, res) => {
// //   const { title: caseTitle, type: caseType } = req.body;
// //   const email = req.user.email;

// //   try {
// //     // Validate input
// //     if (!caseTitle || !caseType) {
// //       return res.status(400).json({
// //         status: 400,
// //         message: "Case title and type are required."
// //       });
// //     }

// //     const case_n = new Caseses({
// //       caseTitle,
// //       caseType,
// //     });

// //     // Ensure user exists before updating the reports
// //     const user = await mongo.findOne({ email });
// //     if (!user) {
// //       return res.status(404).json({
// //         status: 404,
// //         message: "User not found."
// //       });
// //     }

// //     // Update user reports with the new case title
// //     await mongo.updateOne({ email }, { $push: { reports: caseTitle } });
// //     await case_n.save();

// //     return res.status(200).json({
// //       status: 200,
// //       message: "Case created successfully",
// //     });
// //   } catch (error) {
// //     console.error("❌ Error creating new case:", error);
// //     return res.status(500).json({
// //       status: 500,
// //       message: "Failed to create new case",
// //       error: error.message, // Include the specific error message
// //     });
// //   }
// // });

// // // /cases Route to fetch all cases
// // app.get('/cases', async (req, res) => {
// //   try {
// //     const cases = await Caseses.find({});
// //     return res.status(200).json({ status: 200, data: cases });
// //   } catch (err) {
// //     console.error("❌ Error fetching cases:", err); // Log the error
// //     return res.status(500).json({
// //       status: 500,
// //       message: 'Error fetching cases',
// //       error: err.message, // Provide more detailed error info
// //     });
// //   }
// // });


// // app.post('/signup', async (req, res) => {
// //   const { email, password, confirm_Password } = req.body;

// //   if (password !== confirm_Password) {
// //     return res.status(400).json({ status: 400, message: "Passwords do not match" });
// //   }

// //   const hashedPassword = await bcrypt.hash(password, saltRounds);
// //   const isValid = await isEmailValid(email);

// //   if (!isValid) {
// //     return res.json({ status: 400, message: "Email domain is invalid or does not exist." });
// //   }

// //   try {
// //     const user = await mongo.findOne({ email });
// //     if (user) {
// //       return res.json({ status: 400, message: "User already exists" });
// //     }

// //     const newUser = new mongo({ email, password: hashedPassword });
// //     await newUser.save();
// //     return res.json({ status: 200, message: "User created successfully" });

// //   } catch (error) {
// //     console.error('❌ Signup Error:', error);
// //     return res.json({ status: 500, message: "Failed to signup" });
// //   }
// // });

// // app.post('/login', async (req, res) => {
// //   const { email, password } = req.body;
// //   try {
// //     const user = await mongo.findOne({ email });
// //     if (!user) return res.status(410).json({ status: 410, message: 'User not found' });

// //     const isValid = await bcrypt.compare(password, user.password);
// //     if (isValid) {
// //       const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
// //         expiresIn: process.env.JWT_EXPIRES_IN || '1d',
// //       });

// //       return res.status(200).json({ status: 200, message: 'Login successful', token });

// //     } else {
// //       return res.status(401).json({ status: 401, message: 'Invalid password' });
// //     }
// //   } catch (error) {
// //     console.error("❌ Error finding user:", error);
// //     return res.status(500).json({ status: 500, message: 'Internal server error' });
// //   }
// // });

// // app.post('/forgot-password', async (req, res) => {
// //   const { email } = req.body;
// //   const user = await mongo.findOne({ email });

// //   if (!user) {
// //     return res.json({ status: 404, message: "User not found." });
// //   }

// //   const resetCode = generateCode();
// //   verificationCodes[email] = resetCode;
// //   await sendEmail(email, resetCode);
// //   res.json({ status: 200, message: "Reset code sent to your email." });
// // });

// // app.post('/reset-password', async (req, res) => {
// //   const { email, resetcode, newpassword, confirmpassword } = req.body;

// //   if (newpassword !== confirmpassword) {
// //     return res.status(400).json({ status: 400, message: "Passwords do not match" });
// //   }

// //   if (String(verificationCodes[email]) !== String(resetcode)) {
// //     return res.status(404).json({ status: 404, message: "Code not verified" });
// //   }

// //   try {
// //     const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
// //     const updated = await mongo.updateOne(
// //       { email },
// //       { $set: { password: hashedPassword } },
// //       { upsert: false }
// //     );

// //     delete verificationCodes[email];

// //     if (updated.matchedCount === 0) {
// //       return res.status(404).json({ status: 404, message: "User not found" });
// //     }

// //     if (updated.modifiedCount > 0) {
// //       return res.status(200).json({ status: 200, message: "Password updated successfully" });
// //     } else {
// //       return res.status(500).json({ status: 500, message: "Password update failed or same as old password" });
// //     }
// //   } catch (error) {
// //     console.error("❌ Error updating password:", error);
// //     return res.status(500).json({ status: 500, message: "Something went wrong" });
// //   }
// // });


// // app.listen(5500, () => {
// //   console.log('🚀 Server started on port 5500');
// // });







// require('dotenv').config(); 

// let express = require('express');
// let app = express();
// const mongoose=require('mongoose');
// let mongo = require('./datbase/mongo'); 
// const cors = require('cors');
// const nodemailer = require('nodemailer');
// const bcrypt = require('bcrypt');
// const validator = require('validator');
// const message=require('./datbase/message');
// const dns = require('dns');
// const Cases = require('./datbase/cases'); // Corrected import
// const jwt = require('jsonwebtoken');
// const commoncase=require('./datbase/usercases');
// const multer = require('multer');
// const upload = multer({ dest: "uploads/" });

// app.use(express.json());
// app.use(cors());

// const saltRounds = 10;
// const verificationCodes = {};
// const otp={}

// // ✅ Check for missing JWT_SECRET at startup
// if (!process.env.JWT_SECRET) {
//   console.error("❌ ERROR: JWT_SECRET is not set in .env file.");
//   process.exit(1); // Exit to prevent insecure behavior
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, 'uploads');
//     console.log('Saving image to:', uploadPath);  // This will show where images are being stored
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   }
// });
//  // Store files in memory as Buffer
// const upload_img = multer({ storage });


// function generateCode() {
//   return Math.random().toString(36).substring(2, 8).toUpperCase();
// }

// function generateOtp() {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }


// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   console.log("🔐 Received Token:", token);

//   if (!token) {
//     return res.status(401).json({ status: 401, message: 'Token not found' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       console.error("❌ JWT verification error:", err);
//       if (err.name === 'TokenExpiredError') {
//         return res.status(401).json({ status: 401, message: 'Token expired' });
//       }
//       return res.status(403).json({ status: 403, message: 'Invalid token' });
//     }
//     req.user = user;
//     next();
//   });
// }

// async function isEmailValid(email) {
//   if (!validator.isEmail(email)) return false;
//   const domain = email.split('@')[1];
//   return new Promise((resolve) => {
//     dns.resolveMx(domain, (err, addresses) => {
//       resolve(!err && addresses && addresses.length > 0);
//     });
//   });
// }

// async function sendEmail(email, code) {
//   try {
//     await transporter.sendMail({
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: 'Your Verification Code',
//       text: `Your verification code is: ${code}`,
//     });
//     console.log('📧 Code sent to email:', email);
//   } catch (error) {
//     console.error('❌ Error sending email:', error);
//   }
// }

// app.get('/checklogin', authenticateToken, (req, res) => {
//   return res.json({ status: 200, message: "User logged in", user: req.user });
// });

// // app.post('/resent_otp',authenticateToken,async(req,res)=>{
// //   const email = req.body.email || req.user.email;
// //   otp.mailcode=generateOtp();
// //   try{
// //     await sendEmail(email, otp.mailcode);
// //     return res.json({
// //       status:200,
// //       message:"OTP Resent Sucessfully"
// //     })

// //   }catch(err){
// //     return res.json({
// //       status:404,
// //       message:"Error sending mail"
// //     })
// //   }
  

// // })

// app.post('/resent-otp', authenticateToken, async (req, res) => {
//   // Check if email is provided in the request body (for password reset)
//   const email = req.body.email || req.user.email;

//   // Make sure we have a valid email
//   if (!email) {
//     return res.json({
//       status: 400,
//       message: "Email is required."
//     });
//   }

//   otp.mailcode = generateOtp();

//   try {
//     await sendEmail(email, otp.mailcode);
//     return res.json({
//       status: 200,
//       message: "OTP Resent Successfully"
//     });
//   } catch (err) {
//     return res.json({
//       status: 404,
//       message: "Error sending mail"
//     });
//   }
// });


// app.post('/verify-otp', (req, res) => {
//     const { otp: userOtp } = req.body;
  
//     if (!otp.mailcode) {
//       return res.status(500).json({
//         status: 500,
//         message: "OTP not generated. Please resend OTP.",
//       });
//     }
  
//     if (userOtp === otp.mailcode) {
//       otp.mailcode = null; // Invalidate OTP
//       return res.status(200).json({
//         status: 200,
//         message: "Login successful",
//       });
//     } else {
//       return res.status(401).json({
//         status: 401,
//         message: "Invalid OTP",
//       });
//     }
//   });
  

//   app.get('/conversations/:caseId', async (req, res) => {
//     const { caseId } = req.params;
//     // console.log(req.query);
//     let skip = parseInt(req.query.skip) || 0;  // how many messages to skip
//     let limit = parseInt(req.query.limit) || 50;  // how many messages to fetch
    
//     // Ensure valid skip and limit values
//     skip = Math.max(skip, 0);
//     limit = Math.max(limit, 1);  // Avoid 0 or negative limit values
  
//     try {
//       const conversation = await message.findOne({ case_id: caseId });
  
//       if (!conversation) {
//         return res.json({ messages: [] });
//       }
  
//       const totalMessages = conversation.messages.length;
      
//       // Check if we are in the valid range for pagination
//       const start = Math.max(totalMessages - skip - limit, 0);
//       const end = totalMessages - skip;
  
//       const paginatedMessages = conversation.messages.slice(start, end);
  
//       // Send response with messages and hasMore flag
//       res.json({
//         messages: paginatedMessages,
//         hasMore: start > 0 // Check if there are more messages to load
//       });
  
//     } catch (error) {
//       console.error('Error retrieving conversation:', error);
//       res.status(500).json({ error: 'Error loading conversation' });
//     }
//   });
  


// // POST /messages
// app.post('/message', async (req, res) => {
//   const { senderId, receiverId, text } = req.body;

//   try {
//     let conversation = await Conversation.findOne({
//       userIds: { $all: [senderId, receiverId] }
//     });

//     if (!conversation) {
//       conversation = new Conversation({ userIds: [senderId, receiverId], messages: [] });
//     }

//     const newMessage = {
//       index: conversation.messages.length,
//       senderId,
//       text,
//       timestamp: new Date()
//     };

//     conversation.messages.push(newMessage);

//     await conversation.save();

//     res.status(201).json({ message: 'Message saved successfully!' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error saving message' });
//   }
// });


// // POST /conversations/:caseId/messages
// // app.post('/messages/:caseId', async (req, res) => {
// //   const { caseId } = req.params;
// //   const { text } = req.body;
// //   let senderId="";
// //   if (!senderId || !text) {
// //     return res.status(400).json({ error: 'Missing senderId or text' });
// //   }
  
// //   try {
// //     const conversation = await message.findOne({ case_id: caseId });
// //     const objectId = new mongoose.Types.ObjectId(caseId);
// //     const found=await commoncase({_id:objectId});
// //     if(found){
// //       senderId=found.officer;
// //     }
// //     if (!conversation) {
// //       return res.status(404).json({ error: 'Conversation not found' });
// //     }

// //     conversation.messages.push({
// //       senderId,
// //       text,
// //       timestamp: new Date()
// //     });

// //     await conversation.save();

// //     res.status(200).json({ message: 'Message added', conversation });
// //   } catch (error) {
// //     console.error('Error saving message:', error);
// //     res.status(500).json({ error: 'Failed to add message' });
// //   }
// // });


// app.post('/messages/:caseId', async (req, res) => {
//   const { caseId } = req.params;
//   const { text, senderId } = req.body;

//   console.log("Request body:", req.body); // Log incoming data

//   if (!text) {
//     return res.status(400).json({ error: 'Missing text' });
//   }
//   let resolvedSenderId = senderId || ""; // or resolve from database if senderId is empty
//   try {
//     const conversation = await message.findOne({ case_id: caseId });

//     const objectId = new mongoose.Types.ObjectId(caseId);
//     const found = await commoncase.findOne({ _id: objectId });
//     if (found) {
//       resolvedSenderId = found.officer; // Default senderId if not provided
//     }

//     if (!resolvedSenderId) {
//       return res.status(400).json({ error: 'Could not resolve senderId from case' });
//     }

//     if (!conversation) {
//       return res.status(404).json({ error: 'Conversation not found' });
//     }

//     conversation.messages.push({
//       senderId: resolvedSenderId,
//       text,
//       timestamp: new Date(),
//     });

//     await conversation.save();

//     res.status(200).json({ message: 'Message added', conversation });
//   } catch (error) {
//     console.error('Error saving message:', error);
//     res.status(500).json({ error: 'Failed to add message' });
//   }
// });






// app.post('/newcase', authenticateToken, async (req, res) => {
//   const { title: caseTitle, type: caseType } = req.body;
//   const email = req.user.email;
  

//   try {
//     // Validate input
//     if (!caseTitle || !caseType) {
//       return res.status(400).json({
//         status: 400,
//         message: "Case title and type are required."
//       });
//     }
//     const case_n = new Cases({
//       caseTitle,
//       caseType,
//       email,
//     });

//     // Ensure user exists before updating the reports
//     const user = await mongo.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         status: 404,
//         message: "User not found."
//       });
//     }

    
//     await mongo.updateOne({ email }, { $push: { reports: caseTitle } });
//     await case_n.save();

//     return res.status(200).json({
//       status: 200,
//       message: "Case created successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error creating new case:", error);
//     return res.status(500).json({
//       status: 500,
//       message: "Failed to create new case",
//       error: error.message, // Include the specific error message
//     });
//   }
// });


// app.post('/common_cases', authenticateToken, async (req, res) => {
//   const { title, type, description, location, datetime, suspect, evidence } = req.body;
//   const mail = req.user.email;

//   try {
//     // Fetch all officers
//     const officers = await mongo.find({});

//     if (officers.length === 0) {
//       return res.status(404).json({ status: 404, message: "No officers available" });
//     }

//     // Find officer with minimum reports
//     let selectedOfficer = officers[0];
//     officers.forEach(officer => {
//       if (officer.reports.length < selectedOfficer.reports.length) {
//         selectedOfficer = officer;
//       }
//     });

//     console.log('Selected Officer:', selectedOfficer.email);

//     // Create the new case
//     const newCase = new commoncase({
//       title,
//       type,
//       email: mail,
//       description,
//       location,
//       suspect,
//       evidence,
//       datetime: new Date(datetime),
//       officer: selectedOfficer.email
//     });

//     // Save the new case
//     await newCase.save();

//     const msg=new message({
//       case_id:newCase._id,
//       userIds:mail,
//     })
//     await msg.save();
//     // Update the officer's reports array with the new case title
//     selectedOfficer.reports.push(title);
//     await selectedOfficer.save();


//     return res.status(200).json({
//       status: 200,
//       message: "Case created and assigned to officer successfully",
//     });

//   } catch (err) {
//     console.error("Error details:", err);
//     return res.status(500).json({
//       status: 500,
//       message: "Failed to create new case",
//       error: err.message,
//     });
//   }
// });



// app.get('/cases', authenticateToken, async (req, res) => {
//   const email = req.user.email;

//   try {
//     const logeduser = await mongo.findOne({ email });

//     if (!logeduser) {
//       return res.status(404).json({ status: 404, message: 'User not found' });
//     }

//     const userReports = logeduser.reports; // Array of case titles

//     const cases = await Cases.find({ caseTitle: { $in: userReports } });

//     return res.status(200).json({ status: 200, data: cases });
//   } catch (err) {
//     console.error("❌ Error fetching cases:", err);
//     return res.status(500).json({
//       status: 500,
//       message: 'Error fetching cases',
//       error: err.message,
//     });
//   }
// });

// app.get('/commonscases', authenticateToken, async (req, res) => {
//   const email = req.user.email; // Extract email from the JWT payload

//   try {
//     // Fetch cases related to the logged-in user (match the email field)
//     const cases = await commoncase.find({ email });

//     if (cases.length === 0) {
//         return res.status(200).json({
//           status: 200,
//           data: [],
//           message: 'No cases found for this user.',
//         });
      
//     }

//     return res.status(200).json({
//       status: 200,
//       data: cases, // Send the cases array as the response
//     });
//   } catch (err) {
//     console.error("❌ Error fetching cases:", err);
//     return res.status(500).json({
//       status: 500,
//       message: 'Error fetching cases',
//       error: err.message,
//     });
//   }
// });


// // app.post('/Upload_images',authenticateToken,async(req,res)=>{
// //   const email=req.user.email;
// //   let {files,caseid}=req.body;
// //   caseid=caseid.split("#")[1];
// //   try{
// //     const check=await mongo.findOne(email);
// //     if(check){
// //       const fileupload=await Cases.find(caseid);
// //       fileupload.updateOne(
// //         {caseid},
// //         { $push: {images:files}}
// //       )
// //       return res.json({
// //         status:200,
// //         message:"File uploaded sucessfully"
// //       })
// //     }

// //   }catch(err){
// //     res.json({
// //       status:404,
// //       message:"Error in retriving files"
// //     })

// //   }
// // })

// app.post('/Upload_images', authenticateToken, upload.array("images"), async (req, res) => {
//   try {
//     const email = req.user.email;
//     const { caseid: rawCaseid } = req.body;
//     const files = req.files;

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         status: 400,
//         message: "No files uploaded",
//       });
//     }

//     const caseid = rawCaseid?.includes("#") ? rawCaseid.split("#")[1] : rawCaseid;

//     const user = await mongo.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         status: 404,
//         message: "User not found",
//       });
//     }

//     // Check if the case exists in the Cases collection
//     const caseDoc = await Cases.findOne({ caseid });
//     if (!caseDoc) {
//       const uDoc = await commoncase.findOne({ caseid });
//       if (!uDoc) {
//         return res.status(500).json({
//           status: 500,
//           message: "No case found",
//         });
//       }

//       // Prepare image data for MongoDB
//       const newImageDocs = files.map((file) => ({
//         image_id: file.originalname,  // Use the original filename as the image_id
//         data: file.buffer,            // Store the file data as a Buffer
//         contentType: file.mimetype,   // Store the file's MIME type (e.g., "image/jpeg")
//         uploadedAt: new Date(),       // Timestamp when the image is uploaded
//       }));

//       const existingImages = uDoc.images || [];
//       const newUniqueFiles = newImageDocs.filter((file) => !existingImages.some(existing => existing.image_id === file.image_id));

//       if (newUniqueFiles.length === 0) {
//         return res.status(409).json({
//           status: 409,
//           message: "All selected files are already uploaded",
//         });
//       }

//       // Add new unique images to the commoncase collection
//       await commoncase.updateOne(
//         { caseid },
//         { $addToSet: { images: { $each: newUniqueFiles } } }
//       );

//       return res.status(200).json({
//         status: 200,
//         message: "Files uploaded successfully",
//         uploaded: newUniqueFiles.length,
//       });
//     }

//     // Prepare image data for MongoDB
//     const newImageDocs = files.map((file) => ({
//       image_id: file.originalname,  // Use the original filename as the image_id
//       data: file.buffer,            // Store the file data as a Buffer
//       contentType: file.mimetype,   // Store the file's MIME type (e.g., "image/jpeg")
//       uploadedAt: new Date(),       // Timestamp when the image is uploaded
//     }));

//     const existingImages = caseDoc.images || [];
//     const newUniqueFiles = newImageDocs.filter((file) => !existingImages.some(existing => existing.image_id === file.image_id));

//     if (newUniqueFiles.length === 0) {
//       return res.status(409).json({
//         status: 409,
//         message: "All selected files are already uploaded",
//       });
//     }

//     // Add new unique images to the Cases collection
//     await Cases.updateOne(
//       { caseid },
//       { $addToSet: { images: { $each: newUniqueFiles } } }
//     );

//     return res.status(200).json({
//       status: 200,
//       message: "Files uploaded successfully",
//       uploaded: newUniqueFiles.length,
//     });

//   } catch (err) {
//     console.error("Error uploading images:", err);
//     return res.status(500).json({
//       status: 500,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// });

// app.get('/get_case_images/:caseid', async (req, res) => {
//   const { caseid } = req.params;

//   try {
//     // Try to find the case in the Cases collection
//     const caseDoc = await Cases.findOne({ _id:caseid });

//     if (!caseDoc) {
//       // If the case is not found in the Cases collection, check the commoncase collection
//       const uDoc = await commoncase.findOne({ _id:caseid });
      
//       if (!uDoc) {
//         return res.status(404).json({
//           status: 404,
//           message: "Case not found"
//         });
//       }

//       // If case found in commoncase, retrieve images
//       const images = uDoc.images;

//       if (images.length === 0) {
//         return res.status(200).json({
//           status: 404,
//           message: "No images found for this case"
//         });
//       }

//       // Map the image data to the desired format
//       const imageData = images.map((image) => ({
//         image_id: image.image_id,  // Image's unique identifier
//         imageUrl: `/images/${image.image_id}`,  // URL to the image
//         contentType: image.contentType,
//         uploadedAt: image.uploadedAt
//       }));

//       return res.status(200).json({
//         status: 200,
//         message: "Images retrieved successfully",
//         images: imageData
//       });
//     }

//     // If the case is found in the Cases collection, retrieve the images
//     const images = caseDoc.images;

//     if (images.length === 0) {
//       return res.status(200).json({
//         status: 404,
//         message: "No images found for this case"
//       });
//     }

//     // Map the image data to the desired format
//     const imageData = images.map((image) => ({
//       image_id: image.image_id,
//       imageUrl: `/images/${image.image_id}`,  // URL for the image
//       contentType: image.contentType,
//       uploadedAt: image.uploadedAt
//     }));

//     // Send the image data back in the response
//     return res.status(200).json({
//       status: 200,
//       message: "Images retrieved successfully",
//       images: imageData
//     });
//   } catch (err) {
//     console.error("Error retrieving images:", err);
//     return res.status(500).json({
//       status: 500,
//       message: "Error retrieving images",
//       error: err.message
//     });
//   }
// });


// app.get('/images/:image_id', (req, res) => {
//   const { image_id } = req.params;
//   const imageFilePath = path.join(__dirname, 'uploads', image_id);  // Assuming you're storing the images in a folder called 'uploads'

//   fs.readFile(imageFilePath, (err, data) => {
//     if (err) {
//       return res.status(404).json({ message: 'Image not found' });
//     }
//     res.contentType('image/jpeg');  // Adjust this to match the actual file type, like image/png, etc.
//     res.send(data);
//   });
// });





// app.post('/signup', async (req, res) => {
//   const { email, password, confirm_Password } = req.body;

//   if (password !== confirm_Password) {
//     return res.status(400).json({ status: 400, message: "Passwords do not match" });
//   }

//   const hashedPassword = await bcrypt.hash(password, saltRounds);
//   const isValid = await isEmailValid(email);

//   if (!isValid) {
//     return res.json({ status: 400, message: "Email domain is invalid or does not exist." });
//   }

//   try {
//     const user = await mongo.findOne({ email });
//     if (user) {
//       return res.json({ status: 400, message: "User already exists" });
//     }

//     const newUser = new mongo({ email, password: hashedPassword });
//     await newUser.save();
//     return res.json({ status: 200, message: "User created successfully" });

//   } catch (error) {
//     console.error('❌ Signup Error:', error);
//     return res.json({ status: 500, message: "Failed to signup" });
//   }
// });

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   otp.mailcode=generateOtp();
//   try {
//     const user = await mongo.findOne({ email });
//     if (!user) return res.status(410).json({ status: 410, message: 'User not found' });

//     const isValid = await bcrypt.compare(password, user.password);
//     if (isValid) {
//       const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN || '1d',
//       });
//       // await sendEmail(email, otp.mailcode);

//       return res.status(200).json({ status: 200, message: 'Login successful', token });

//     } else {
//       return res.status(401).json({ status: 401, message: 'Invalid password' });
//     }
//   } catch (error) {
//     console.error("❌ Error finding user:", error);
//     return res.status(500).json({ status: 500, message: 'Internal server error' });
//   }
// });

// app.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;
//   const user = await mongo.findOne({ email });

//   if (!user) {
//     return res.json({ status: 404, message: "User not found." });
//   }

//   const resetCode = generateCode();
//   verificationCodes[email] = resetCode;
//   await sendEmail(email, resetCode);
//   res.json({ status: 200, message: "Reset code sent to your email." });
// });

// app.post('/reset-password', async (req, res) => {
//   const { email, resetcode, newpassword, confirmpassword } = req.body;

//   if (newpassword !== confirmpassword) {
//     return res.status(400).json({ status: 400, message: "Passwords do not match" });
//   }

//   if (String(verificationCodes[email]) !== String(resetcode)) {
//     return res.status(404).json({ status: 404, message: "Code not verified" });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
//     const updated = await mongo.updateOne(
//       { email },
//       { $set: { password: hashedPassword } },
//       { upsert: false }
//     );

//     delete verificationCodes[email];

//     if (updated.matchedCount === 0) {
//       return res.status(404).json({ status: 404, message: "User not found" });
//     }

//     if (updated.modifiedCount > 0) {
//       return res.status(200).json({ status: 200, message: "Password updated successfully" });
//     } else {
//       return res.status(500).json({ status: 500, message: "Password update failed or same as old password" });
//     }
//   } catch (error) {
//     console.error("❌ Error updating password:", error);
//     return res.status(500).json({ status: 500, message: "Something went wrong" });
//   }
// });

// app.listen(5500, () => {
//   console.log('🚀 Server started on port 5500');
// });































// import { useState, useCallback, useEffect } from "react";
// import { Link, useParams } from "react-router-dom";
// import {
//   ArrowLeft,
//   Upload,
//   Image,
//   FileText,
//   Save,
//   Microscope,
//   Fingerprint,
//   Trash2,
//   Camera,
//   BarChart3,
//   PanelLeft,
//   Eye,
//   Share,
//   Settings,
//   UploadCloud,
//   Plus,
//   FileUp,
//   ChevronRight,
//   MessageSquare,
//   Book,
//   Scroll,
//   LayoutGrid,
//   Info,
//   Check,
//   Loader,
//   X,
//   ZoomIn,
//   ZoomOut,
//   RotateCcw,
//   BrainCircuit,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { useToast } from "@/hooks/use-toast";
// import { Textarea } from "@/components/ui/textarea";
// import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
// // import { useForm } from "react-hook-form";
// import { Card, CardContent } from "@/components/ui/card";
// // import API, { forensicService } from "@/services/api";
// // import { supabase } from "@/integrations/supabase/client";

// type UploadedImage = {
//   id: string;
//   src: string;
//   name: string;
//   date: Date;
//   type?: "image"; // Add optional type property
// };

// type UploadedDocument = {
//   id: string;
//   name: string;
//   type: string;
//   date: Date;
// };

// type SourceType = "all" | "images" | "documents";
// type ActiveTab = "sources" | "chat" | "studio";

// type ForensicSummary = {
//   case_id: string;
//   image_id: string;
//   crime_type: string | null;
//   objects_detected: string[] | null;
//   summary: string | null;
//   created_at?: string;
// };

// type ForensicReport = {
//   case_id: string;
//   report: string | null;
//   created_at?: string;
// };

// export default function Case() {
//   const { caseId } = useParams();
//   const [caseName, setCaseName] = useState(`Case #${caseId?.replace("case-", "")}`);
//   const [description, setDescription] = useState("");
//   const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
//   const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
//   const [activeTab, setActiveTab] = useState<ActiveTab>("sources");
//   const [loading, setLoading] = useState(false);
//   const [analyzing, setAnalyzing] = useState(false);
//   const [sourceType, setSourceType] = useState<SourceType>("all");
//   const [isUploading, setIsUploading] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [summary, setSummary] = useState<string | null>(null);
//   const [displayedSummary, setDisplayedSummary] = useState<string | null>(null);
//   const [isSummarizing, setIsSummarizing] = useState(false);
//   const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
//   const [crimeType, setCrimeType] = useState<string | null>(null);
//   const [connectionError, setConnectionError] = useState<string | null>(null);
//   const { toast } = useToast();

//   const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:8000';

//   useEffect(() => {
//     const checkApiConnection = async () => {
//       try {
//         await fetch(`${FLASK_API_URL}/health`, {
//           method: 'HEAD',
//           mode: 'no-cors'
//         });
//         setConnectionError(null);
//       } catch (error) {
//         console.error("Cannot connect to ML API", error);
//         setConnectionError("Cannot connect to ML service. Please ensure it's running and accessible.");
//       }
//     };

//     checkApiConnection();
//   }, [FLASK_API_URL]);

//   useEffect(() => {
//     if (summary && summary !== displayedSummary) {
//       let currentIndex = 0;
//       const fullText = summary;

//       if (!displayedSummary || displayedSummary.endsWith("...")) {
//         setDisplayedSummary("");
//       }

//       const interval = setInterval(() => {
//         if (currentIndex < fullText.length) {
//           setDisplayedSummary(prevText =>
//             prevText + fullText.charAt(currentIndex)
//           );
//           currentIndex++;
//         } else {
//           clearInterval(interval);
//         }
//       }, 10);

//       return () => clearInterval(interval);
//     }
//   }, [summary, displayedSummary]);

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     setIsUploading(true);

//     const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//     const docTypes = ['application/pdf', 'text/plain', 'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

//     try {
//       const newImages: UploadedImage[] = [];
//       const newDocs: UploadedDocument[] = [];

//       for (const file of Array.from(files)) {
//         if (imageTypes.includes(file.type)) {
//           const result = await readFileAsDataURL(file);
//           newImages.push({
//             id: generateId(),
//             src: result,
//             name: file.name,
//             date: new Date()
//           });
//         } else if (docTypes.includes(file.type)) {
//           newDocs.push({
//             id: generateId(),
//             name: file.name,
//             type: file.type,
//             date: new Date()
//           });
//         }
//       }

//       if (newImages.length > 0) {
//         setUploadedImages(prev => [...prev, ...newImages]);
//       }

//       if (newDocs.length > 0) {
//         setUploadedDocs(prev => [...prev, ...newDocs]);
//       }

//       const totalFiles = newImages.length + newDocs.length;
//       if (totalFiles > 0) {
//         toast({
//           title: "Upload Successful",
//           description: `Uploaded ${totalFiles} file${totalFiles !== 1 ? 's' : ''}.`,
//         });
//       } else {
//         toast({
//           title: "No valid files",
//           description: "Please upload images or documents.",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Error uploading files:", error);
//       toast({
//         title: "Upload Failed",
//         description: "There was a problem uploading your files.",
//         variant: "destructive"
//       });
//     } finally {
//       setIsUploading(false);

//       if (e.target) {
//         e.target.value = '';
//       }
//     }
//   };

//   const readFileAsDataURL = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         if (event.target?.result) {
//           resolve(event.target.result.toString());
//         } else {
//           reject(new Error("Failed to read file"));
//         }
//       };
//       reader.onerror = () => reject(reader.error);
//       reader.readAsDataURL(file);
//     });
//   };

//   const generateId = () => {
//     return Date.now().toString(36) + Math.random().toString(36).substring(2);
//   };

//   const handleDeleteImage = (id: string) => {
//     setUploadedImages(prev => prev.filter(img => img.id !== id));

//     if (selectedImage && selectedImage.id === id) {
//       setSelectedImage(null);
//       setSummary(null);
//       setDisplayedSummary(null);
//       setDetectedObjects([]);
//       setCrimeType(null);
//     }

//     toast({
//       title: "Image Deleted",
//       description: "The image has been removed from your case.",
//     });
//   };

//   const handleDeleteDocument = (id: string) => {
//     setUploadedDocs(prev => prev.filter(doc => doc.id !== id));

//     toast({
//       title: "Document Deleted",
//       description: "The document has been removed from your case.",
//     });
//   };

// //   const handleSelectImage = (image: UploadedImage) => {
// //     setSelectedImage(image);
// //     setActiveTab("chat");
// //     setZoomLevel(1);

// //     if (caseId) {
// //       checkExistingSummary(image.id).catch(error => {
// //         console.error("Error loading existing summary:", error);
// //       });
// //     } else {
// //       setSummary(null);
// //       setDisplayedSummary(null);
// //       setDetectedObjects([]);
// //       setCrimeType(null);
// //     }
// //   };

//   const handleZoomIn = () => {
//     setZoomLevel(prev => Math.min(prev + 0.25, 3));
//   };

//   const handleZoomOut = () => {
//     setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
//   };

//   const handleResetZoom = () => {
//     setZoomLevel(1);
//   };

// //   const checkExistingSummary = async (imageId: string) => {
// //     if (!caseId) return null;

// //     try {
// //       const existingSummary = await forensicService.getImageSummary(caseId, imageId);
// //       if (existingSummary) {
// //         setSummary(existingSummary.summary);
// //         setDisplayedSummary("");
// //         setDetectedObjects(existingSummary.objects_detected || []);
// //         setCrimeType(existingSummary.crime_type);
// //         return true;
// //       }
// //       return false;
// //     } catch (error) {
// //       console.error("Error checking existing summary:", error);
// //       return false;
// //     }
// //   };

//   const extractImageFile = async (imageSrc: string): Promise<Blob> => {
//     try {
//       const response = await fetch(imageSrc);
//       const blob = await response.blob();
//       return blob;
//     } catch (error) {
//       console.error("Error converting image to blob:", error);
//       throw new Error("Failed to process image file");
//     }
//   };

// //   const generateSummary = async () => {
// //     if (!selectedImage || !caseId) return;

// //     setIsSummarizing(true);
// //     setSummary(null);
// //     setDisplayedSummary("Analyzing image...");
// //     setDetectedObjects([]);
// //     setCrimeType(null);
// //     setConnectionError(null);

// //     try {
// //       console.log("Starting summary generation process...");

// //       const exists = await checkExistingSummary(selectedImage.id);

// //       if (!exists) {
// //         console.log("No existing summary found, generating new one...");

// //         const imageFile = await extractImageFile(selectedImage.src);

// //         const result = await forensicService.generateImageSummary(caseId, selectedImage.id, imageFile);

// //         setSummary(result.summary);
// //         setDetectedObjects(result.objects_detected || []);
// //         setCrimeType(result.crime_type);
// //       } else {
// //         console.log("Using existing summary from database");
// //       }

// //       toast({
// //         title: "Summary Generated",
// //         description: "The image has been successfully analyzed.",
// //       });
// //     } catch (error) {
// //       console.error("Error in generateSummary:", error);

// //       const errorMessage = error.message || `Failed to generate summary. Please ensure the ML server is running at ${FLASK_API_URL}`;
// //       setConnectionError(errorMessage);
// //       setSummary(null);
// //       setDisplayedSummary(null);

// //       toast({
// //         title: "Summary Failed",
// //         description: errorMessage,
// //         variant: "destructive"
// //       });
// //     } finally {
// //       setIsSummarizing(false);
// //     }
// //   };

// //   const generateCaseReport = async () => {
// //     if (!caseId) return;

// //     try {
// //       setAnalyzing(true);

// //       const existingReport = await forensicService.getCaseReport(caseId);

// //       let reportData;
// //       if (existingReport) {
// //         reportData = { report: existingReport.report };
// //       } else {
// //         reportData = await forensicService.generateCaseReport(caseId);
// //       }

// //       toast({
// //         title: "Case Report Generated",
// //         description: "Your complete case report has been generated successfully.",
// //       });

// //       console.log("Case report:", reportData.report);
// //     } catch (error) {
// //       console.error("Error generating case report:", error);

// //       const errorMessage = error.message || "There was a problem generating the case report.";

// //       toast({
// //         title: "Report Generation Failed",
// //         description: errorMessage,
// //         variant: "destructive"
// //       });
// //     } finally {
// //       setAnalyzing(false);
// //     }
// //   };

// //   const analyzeEvidence = () => {
// //     const totalSources = uploadedImages.length + uploadedDocs.length;
// //     if (totalSources === 0) {
// //       toast({
// //         title: "No Evidence to Analyze",
// //         description: "Please upload at least one source before analysis.",
// //         variant: "destructive"
// //       });
// //       return;
// //     }

// //     generateCaseReport();
// //   };

// //   const filteredSources = () => {
// //     if (sourceType === "images") return uploadedImages;
// //     if (sourceType === "documents") return uploadedDocs.map(doc => ({
// //       id: doc.id,
// //       src: "",
// //       name: doc.name,
// //       date: doc.date,
// //       type: "document" as const
// //     }));

// //     const images = uploadedImages.map(img => ({ ...img, type: "image" as const }));
// //     const docs = uploadedDocs.map(doc => ({
// //       id: doc.id,
// //       src: "",
// //       name: doc.name,
// //       date: doc.date,
// //       type: "document" as const
// //     }));

// //     return [...images, ...docs].sort((a, b) => b.date.getTime() - a.date.getTime());
// //   };

// //   const getTotalSourceCount = () => {
// //     return uploadedImages.length + uploadedDocs.length;
// //   };

// //   const form = useForm({
// //     defaultValues: {
// //       notes: "",
// //     },
// //   });

// //   const onSubmitNotes = (data: { notes: string }) => {
// //     toast({
// //       title: "Notes Saved",
// //       description: "Your notes have been saved successfully.",
// //     });
// //     form.reset();
// //   };

//   const closeImagePreview = () => {
//     setSelectedImage(null);
//     setSummary(null);
//     setDisplayedSummary(null);
//     setDetectedObjects([]);
//     setCrimeType(null);
//   };

//   return (
//     <div className="flex flex-col h-screen bg-background">
//       <header className="flex items-center justify-between p-4 border-b">
//         <div className="flex items-center gap-4">
//           <Link to="/dashboard">
//             <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
//               <ArrowLeft className="w-5 h-5 text-primary" />
//             </div>
//           </Link>
//           <h1 className="text-xl font-semibold">{caseName}</h1>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm">
//             <Share className="w-4 h-4 mr-2" />
//             Share
//           </Button>
//           <Button variant="outline" size="sm">
//             <Settings className="w-4 h-4" />
//             Settings
//           </Button>
//           <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
//             U
//           </div>
//         </div>
//       </header>

//       <div className="flex flex-1 overflow-hidden">
//         <div className={`w-96 border-r overflow-y-auto flex flex-col ${activeTab === "sources" ? "block" : "hidden md:block"}`}>
//           <div className="flex items-center justify-between p-4 border-b">
//             <h2 className="font-semibold">Sources</h2>
//             <div className="flex gap-2">
//               <Button variant="ghost" size="icon" onClick={() => setSourceType("all")}
//                 className={sourceType === "all" ? "bg-accent" : ""}>
//                 <LayoutGrid className="w-4 h-4" />
//               </Button>
//               <Button variant="ghost" size="icon" onClick={() => setSourceType("images")}
//                 className={sourceType === "images" ? "bg-accent" : ""}>
//                 <Image className="w-4 h-4" />
//               </Button>
//               <Button variant="ghost" size="icon" onClick={() => setSourceType("documents")}
//                 className={sourceType === "documents" ? "bg-accent" : ""}>
//                 <FileText className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>

//           <div className="p-3">
//             <Input
//               id="file-upload"
//               type="file"
//               className="hidden"
//               accept="image/*,.pdf,.doc,.docx,.txt"
//               multiple
//               onChange={handleFileUpload}
//             />
//             <label htmlFor="file-upload">
//               <Button className="w-full justify-center" size="sm" asChild disabled={isUploading}>
//                 <span>
//                   {isUploading ? (
//                     <>
//                       <Loader className="w-4 h-4 mr-2 animate-spin" />
//                       Uploading...
//                     </>
//                   ) : (
//                     <>
//                       <Plus className="w-4 h-4 mr-2" />
//                       Add source
//                     </>
//                   )}
//                 </span>
//               </Button>
//             </label>
//           </div>

//           {/* {getTotalSourceCount() === 0 ? (
//             <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-muted-foreground">
//               <div className="p-3 bg-muted rounded-lg mb-3">
//                 <FileText className="w-8 h-8" />
//               </div>
//               <h3 className="font-medium">Saved sources will appear here</h3>
//               <p className="text-sm mt-2 max-w-xs">
//                 Click Add source above to add images, PDFs, videos, or other evidence files.
//               </p>

//               <div className="mt-8">
//                 <Input
//                   id="empty-file-upload"
//                   type="file"
//                   className="hidden"
//                   accept="image/*,.pdf,.doc,.docx,.txt"
//                   multiple
//                   onChange={handleFileUpload}
//                 />
//                 <label htmlFor="empty-file-upload">
//                   <Button variant="outline" className="gap-1" asChild>
//                     <span>
//                       <UploadCloud className="h-4 w-4 mr-1" />
//                       Upload a source
//                     </span>
//                   </Button>
//                 </label>
//               </div>
//             </div>
//           ) : (
//             <div className="p-4 space-y-3">
//               {filteredSources().map((item) => {
//                 const isDocument = !item.src || item.type === "document";

//                 return (
//                   <div
//                     key={item.id}
//                     className={`relative group rounded-md border overflow-hidden flex items-center p-2 hover:bg-accent cursor-pointer ${selectedImage && selectedImage.id === item.id ? 'bg-accent' : ''}`}
//                     onClick={() => !isDocument && handleSelectImage(item as UploadedImage)}
//                   >
//                     <div className="h-12 w-12 rounded overflow-hidden mr-3 flex-shrink-0 bg-muted flex items-center justify-center">
//                       {isDocument ? (
//                         <FileText className="h-6 w-6 text-muted-foreground" />
//                       ) : (
//                         <img
//                           src={item.src}
//                           alt={item.name}
//                           className="h-full w-full object-cover"
//                         />
//                       )}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium truncate">{item.name}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {isDocument ? "Document" : "Image"} • Added {item.date.toLocaleDateString()}
//                       </p>
//                     </div>

//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="opacity-0 group-hover:opacity-100"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         isDocument ? handleDeleteDocument(item.id) : handleDeleteImage(item.id);
//                       }}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 );
//               })}

//               <div className="pt-3">
//                 {getTotalSourceCount() > 0 && (
//                   <Button
//                     className="w-full"
//                     onClick={analyzeEvidence}
//                     disabled={analyzing}
//                   >
//                     {analyzing ? (
//                       <>
//                         <Loader className="h-4 w-4 mr-2 animate-spin" />
//                         Generating Case Report...
//                       </>
//                     ) : (
//                       <>
//                         <Microscope className="h-4 w-4 mr-2" />
//                         Generate Case Report
//                       </>
//                     )}
//                   </Button>
//                 )}
//               </div>
//             </div>
//           )} */}

//           <div className="mt-auto p-4 border-t">
//             <div className="flex items-center bg-muted/80 rounded-lg p-3">
//               <div className="flex-1">
//                 <p className="text-sm">
//                   {/* {getTotalSourceCount() === 0
//                     ? "Upload a source to get started"
//                     : `${getTotalSourceCount()} source${getTotalSourceCount() !== 1 ? 's' : ''} added`
//                   } */}
//                 </p>
//                 <p className="text-xs text-muted-foreground">{uploadedImages.length} images, {uploadedDocs.length} documents</p>
//               </div>
//               <Button size="sm" className="rounded-full w-8 h-8 p-0 flex-shrink-0">
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         <div className={`flex-1 flex flex-col ${activeTab === "chat" ? "block" : "hidden md:block"}`}>
//           <div className="flex items-center justify-between p-4 border-b">
//             <h2 className="font-semibold">Chat</h2>
//           </div>

//           <div className="flex-1 flex flex-col p-4 overflow-auto">
//             {selectedImage ? (
//               <div className="w-full h-full flex flex-col">
//                 <div className="border-b pb-2 mb-4 flex justify-between items-center">
//                   <h3 className="font-medium">{selectedImage.name}</h3>
//                   <div className="flex gap-2">
//                     <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In">
//                       <ZoomIn className="h-4 w-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out">
//                       <ZoomOut className="h-4 w-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon" onClick={handleResetZoom} title="Reset Zoom">
//                       <RotateCcw className="h-4 w-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon" onClick={closeImagePreview} title="Close">
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="flex-1 overflow-auto flex items-center justify-center mb-4">
//                   <div className="overflow-auto max-w-full max-h-full">
//                     <img
//                       src={selectedImage.src}
//                       alt={selectedImage.name}
//                       className="object-contain transition-transform"
//                       style={{ transform: `scale(${zoomLevel})` }}
//                     />
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <div className="flex justify-between items-center mb-3">
//                     <h4 className="font-medium">Image Analysis</h4>
//                     {/* <Button
//                       onClick={generateSummary}
//                       disabled={isSummarizing}
//                       className="gap-2"
//                     >
//                       {isSummarizing ? (
//                         <>
//                           <Loader className="h-4 w-4 animate-spin" />
//                           Analyzing...
//                         </>
//                       ) : (
//                         <>
//                           <BrainCircuit className="h-4 w-4" />
//                           Analyze with ML
//                         </>
//                       )}
//                     </Button> */}
//                   </div>

//                   {connectionError && (
//                     <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
//                       <p className="flex items-center">
//                         <X className="h-4 w-4 mr-2 flex-shrink-0" />
//                         <span>{connectionError}</span>
//                       </p>
//                       <p className="text-sm mt-2">
//                         Check that your ML server is running at {FLASK_API_URL} and is properly configured to accept requests from this application.
//                       </p>
//                     </div>
//                   )}

//                   {displayedSummary ? (
//                     <Card className="mb-4">
//                       <CardContent className="pt-6">
//                         {crimeType && (
//                           <div className="mb-4">
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                               Crime Type: {crimeType}
//                             </span>
//                           </div>
//                         )}

//                         {detectedObjects && detectedObjects.length > 0 && (
//                           <div className="mb-4">
//                             <h5 className="text-sm font-medium mb-2">Objects Detected:</h5>
//                             <div className="flex flex-wrap gap-1">
//                               {detectedObjects.map((object, index) => (
//                                 <span
//                                   key={index}
//                                   className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted"
//                                 >
//                                   {object}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>
//                         )}

//                         <div className="prose prose-sm">
//                           {displayedSummary.split('\n').map((paragraph, i) => (
//                             <p key={i} className={i > 0 ? "mt-2" : ""}>{paragraph}</p>
//                           ))}
//                           {isSummarizing && <span className="animate-pulse">|</span>}
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ) : isSummarizing ? (
//                     <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
//                       <Loader className="h-8 w-8 animate-spin mb-3" />
//                       <p>Generating detailed summary...</p>
//                       <p className="text-xs mt-1">This may take a moment</p>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border border-dashed rounded-lg">
//                       <BrainCircuit className="h-8 w-8 mb-3" />
//                       <p>Generate an AI-powered summary of this image</p>
//                       <p className="text-xs mt-1">Click the Analyze with ML button above to analyze this evidence</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ) :
//             //  getTotalSourceCount() === 0 ? (
//             //   <div className="flex flex-col items-center justify-center h-full">
//             //     <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
//             //       <UploadCloud className="w-6 h-6 text-primary" />
//             //     </div>
//             //     <h3 className="text-xl font-medium mb-2">Add a source to get started</h3>
//             //     <p className="text-sm max-w-md mb-8">
//             //       Upload evidence images or documents to analyze or generate forensic reports
//             //     </p>
//             //     <Input
//             //       id="chat-file-upload"
//             //       type="file"
//             //       className="hidden"
//             //       accept="image/*,.pdf,.doc,.docx,.txt"
//             //       multiple
//             //       onChange={handleFileUpload}
//             //     />
//             //     <label htmlFor="chat-file-upload">
//             //       <Button className="gap-1" asChild>
//             //         <span>
//             //           <UploadCloud className="h-4 w-4 mr-1" />
//             //           Upload a source
//             //         </span>
//             //       </Button>
//             //     </label>
//             //   </div>
//             // ) 
//             // : 
//             (
//               <div className="flex flex-col items-center justify-center h-full">
//                 <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
//                 <h3 className="text-lg font-medium">Ask questions about your evidence</h3>
//                 <p className="text-sm mt-2 max-w-md">
//                   Your evidence has been uploaded. Select an image to analyze it, or generate a full case report.
//                 </p>

//                 <Button
//                   className="mt-8"
//                 //   onClick={analyzeEvidence}
//                   disabled={analyzing}
//                 >
//                   {analyzing ? (
//                     <>
//                       <Loader className="h-4 w-4 mr-2 animate-spin" />
//                       Generating Report...
//                     </>
//                   ) : (
//                     <>
//                       <Microscope className="h-4 w-4 mr-2" />
//                       Generate Case Report
//                     </>
//                   )}
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className={`w-96 border-l overflow-y-auto flex flex-col ${activeTab === "studio" ? "block" : "hidden md:block"}`}>
//           <div className="flex items-center justify-between p-4 border-b">
//             <h2 className="font-semibold">Studio</h2>
//             <Button variant="ghost" size="icon">
//               <LayoutGrid className="w-4 h-4" />
//             </Button>
//           </div>

//           <div className="p-4">
//             <div className="mb-8">
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="font-medium flex items-center">
//                   Forensic Overview
//                   <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
//                     <Info className="w-3 h-3" />
//                   </Button>
//                 </h3>
//               </div>

//               <div className="p-4 rounded-lg border bg-card">
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
//                     <Microscope className="w-6 h-6 text-primary" />
//                   </div>
//                   <div>
//                     <h4 className="font-medium">Crime Scene Analysis</h4>
//                     <p className="text-xs text-muted-foreground">
//                       {/* {getTotalSourceCount()} source{getTotalSourceCount() !== 1 ? "s" : ""} uploaded */}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-2">
//                   <Button className="justify-start" variant="outline" size="sm">
//                     <Customize className="w-4 h-4 mr-2" />
//                     Customize
//                   </Button>
//                   {/* <Button className="justify-start" size="sm" onClick={analyzeEvidence} disabled={analyzing}>
//                     <BarChart3 className="w-4 h-4 mr-2" />
//                     Generate
//                   </Button> */}
//                 </div>
//               </div>
//             </div>

//             <div className="mb-6">
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="font-medium">Forensic Tools</h3>
//               </div>

//               <div className="space-y-2">
//                 <Button variant="outline" className="w-full justify-start text-left" size="sm">
//                   <Fingerprint className="h-4 w-4 mr-2 flex-shrink-0" />
//                   <span className="truncate">Fingerprint Analysis</span>
//                 </Button>
//                 <Button variant="outline" className="w-full justify-start text-left" size="sm">
//                   <Camera className="h-4 w-4 mr-2 flex-shrink-0" />
//                   <span className="truncate">Image Enhancement</span>
//                 </Button>
//                 <Button variant="outline" className="w-full justify-start text-left" size="sm">
//                   <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
//                   <span className="truncate">Evidence Report</span>
//                 </Button>
//                 <Button variant="outline" className="w-full justify-start text-left" size="sm">
//                   <BarChart3 className="h-4 w-4 mr-2 flex-shrink-0" />
//                   <span className="truncate">Pattern Recognition</span>
//                 </Button>
//               </div>
//             </div>

//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="font-medium">Notes</h3>
//                 <Dialog>
//                   <DialogTrigger asChild>
//                     <Button variant="ghost" size="sm" className="h-7 gap-1">
//                       <Plus className="h-3.5 w-3.5" />
//                       Add note
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="sm:max-w-[425px]">
//                     <DialogHeader>
//                       <DialogTitle>Add Note</DialogTitle>
//                       <DialogDescription>
//                         Create a new note for this case.
//                       </DialogDescription>
//                     </DialogHeader>
//                     {/* <Form {...form}>
//                       <form onSubmit={form.handleSubmit(onSubmitNotes)} className="space-y-4">
//                         <FormField
//                           control={form.control}
//                           name="notes"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Notes</FormLabel>
//                               <FormControl>
//                                 <Textarea
//                                   placeholder="Enter your notes here..."
//                                   className="min-h-[120px]"
//                                   {...field}
//                                 />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                         <DialogFooter>
//                           <Button type="submit">Save Note</Button>
//                         </DialogFooter>
//                       </form>
//                     </Form> */}
//                   </DialogContent>
//                 </Dialog>
//               </div>

//               <div className="grid grid-cols-2 gap-2 mb-2">
//                 <Button variant="outline" className="justify-start text-left" size="sm">
//                   <Book className="h-4 w-4 mr-2 flex-shrink-0" />
//                   <span className="truncate">Evidence guide</span>
//                 </Button>
//                 <Button variant="outline" className="justify-start text-left" size="sm">
//                   <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
//                   <span className="truncate">Case report</span>
//                 </Button>
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <Button variant="outline" className="justify-start text-left" size="sm">
//                   <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
//                   <span className="truncate">Key findings</span>
//                 </Button>
//                 <Button variant="outline" className="justify-start text-left" size="sm">
//                   <Scroll className="h-4 w-4 mr-2 flex-shrink-0" />
//                   <span className="truncate">Timeline</span>
//                 </Button>
//               </div>

//               <div className="mt-12 flex flex-col items-center justify-center p-6 text-center border rounded-lg">
//                 <div className="p-3 bg-muted rounded-lg mb-3">
//                   <FileText className="w-8 h-8" />
//                 </div>
//                 <h3 className="font-medium">Saved notes will appear here</h3>
//                 <p className="text-xs mt-2 text-muted-foreground">
//                   Save a note or insight to create a new note, or click Add note above
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="md:hidden border-t">
//         <div className="grid grid-cols-3 divide-x">
//           <button
//             className={`flex flex-col items-center py-3 ${activeTab === "sources" ? "text-primary" : "text-muted-foreground"}`}
//             onClick={() => setActiveTab("sources")}
//           >
//             <Image className="h-5 w-5 mb-1" />
//             <span className="text-xs">Sources</span>
//           </button>
//           <button
//             className={`flex flex-col items-center py-3 ${activeTab === "chat" ? "text-primary" : "text-muted-foreground"}`}
//             onClick={() => setActiveTab("chat")}
//           >
//             <MessageSquare className="h-5 w-5 mb-1" />
//             <span className="text-xs">Chat</span>
//           </button>
//           <button
//             className={`flex flex-col items-center py-3 ${activeTab === "studio" ? "text-primary" : "text-muted-foreground"}`}
//             onClick={() => setActiveTab("studio")}
//           >
//             <Microscope className="h-5 w-5 mb-1" />
//             <span className="text-xs">Studio</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Customize({ className }: { className?: string }) {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={className}
//     >
//       <path d="M12 2H2v10h10V2z" />
//       <path d="M22 12h-10v10h10V12z" />
//       <path d="M12 12H2v10h10V12z" />
//       <path d="M22 2h-10v10h10V2z" />
//     </svg>
//   );
// }