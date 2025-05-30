require('dotenv').config();

let express = require('express');
const mongoose = require('mongoose');
let app = express();
const fs = require('fs');
let mongo = require('./datbase/mongo');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const validator = require('validator');
const path = require('path');
const dns = require('dns');
const Cases = require('./datbase/cases'); // Corrected import
const commoncase = require('./datbase/usercases');
const Conversation=require('./datbase/message');
const jwt = require('jsonwebtoken');
const multer = require('multer');
// const upload = multer({ dest: "uploads/" });


const message=require('./datbase/message');
const { console } = require('inspector');

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static(path.join(__dirname, 'uploads')));


const saltRounds = 10;
const verificationCodes = {};
const otp = {}
const emailToSocket = {};
const socketToEmail = {};

const police_ids={"sairohan005@gmail.com":true,

}

// ✅ Check for missing JWT_SECRET at startup
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is not set in .env file.");
  process.exit(1); // Exit to prevent insecure behavior
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // unique filename
  }
});

const upload = multer({ storage });

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

  if (!token) {
    return res.status(401).json({ status: 401, message: 'Token not found' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
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

async function sendEmail(email, code) {// No selection was provided, so I'll suggest a general improvement to the code



// Add a middleware to handle uncaught errors
app.use((err, req, res, next) => {
  console.error('Uncaught error:', err);
  res.status(500).json({ status: 500, message: 'Internal server error' });
});

// Add a middleware to handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});

// Add a middleware to handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`,
    });
    // console.log('📧 Code sent to email:', email);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

app.get('/checklogin', authenticateToken, (req, res) => {
  return res.json({ status: 200, message: "User logged in", user: req.user });
});

app.post('/role', authenticateToken, async (req, res) => {
  const email = req.user.email;
  try {
    // Log to verify if the token is passed correctly
    // console.log("Email from token: ", email);
    
    const getrole = await mongo.findOne({ email: email });
    // console.log("Fetched role data: ", getrole);

    if (getrole) {
      return res.json({
        status: 200,
        message: "Found mail",
        role: getrole.role,  
      });
    }

    return res.json({
      status: 404,
      message: "User Not Found",
      role: "", 
    });
  } catch (err) {
    console.error("Error in checking role:", err);
    return res.json({
      status: 500,
      message: "Error in checking mail",
      role: "",
    });
  }
});




app.post('/verify-otp', async(req, res) => {
  const { email:mail,otp: userOtp } = req.body;

  if (!otp.mailcode) {
    return res.status(500).json({
      status: 500,
      message: "OTP not generated. Please resend OTP.",
    });
  }

  if (userOtp === otp.mailcode) {
    otp.mailcode = null; // Invalidate OTP
    const check=await mongo.findOne({email:mail});
    const token = jwt.sign({ email: mail }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN || '1d',});
    if(check.role==="police")
      {return res.status(200).json({
        status: 200,
        message: "Login successful",
        token
      });
    }else{
      return res.status(200).json({
        status: 210,
        message: "Login successful",
        token
      });

    }

  } else {
    return res.status(401).json({
      status: 401,
      message: "Invalid OTP",
    });
  }
});


app.get('/conversations/:caseId', async (req, res) => {
  const  caseId  = req.params.caseId;
  // console.log(req.query);
  let skip = parseInt(req.query.skip) || 0;  // how many messages to skip
  let limit = parseInt(req.query.limit) || 50;  // how many messages to fetch
  
  // Ensure valid skip and limit values
  skip = Math.max(skip, 0);
  limit = Math.max(limit, 1);  // Avoid 0 or negative limit values

  try {
    const conversation = await message.findOne({ case_id: caseId });
    // console.log(conversation)
    if (!conversation) {
      return res.json({ messages: [] });
    }

    const totalMessages = conversation.messages.length;
    
    // Check if we are in the valid range for pagination
    const start = Math.max(totalMessages - skip - limit, 0);
    const end = totalMessages - skip;

    const paginatedMessages = conversation.messages.slice(start, end);

    // Send response with messages and hasMore flag
    res.json({
      mail:conversation.userIds,
      messages: paginatedMessages,
      hasMore: start > 0 // Check if there are more messages to load
    });

  } catch (error) {
    console.error('Error retrieving conversation:', error);
    res.status(500).json({ error: 'Error loading conversation' });
  }
});


app.post('/messages/:caseId', async (req, res) => {
  const caseId  = req.params.caseId;
  const { text, senderId } = req.body;

  // console.log("Request body:", req.body); // Log incoming data

  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }
  let resolvedSenderId = senderId || ""; // or resolve from database if senderId is empty
  try {
    const conversation = await message.findOne({ case_id: caseId });

    const objectId = new mongoose.Types.ObjectId(caseId);
    const found = await commoncase.findOne({ _id: objectId });
    if (found) {
      resolvedSenderId = found.officer; // Default senderId if not provided
    }

    if (!resolvedSenderId) {
      return res.status(400).json({ error: 'Could not resolve senderId from case' });
    }

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    // console.log(resolvedSenderId);

    conversation.messages.push({
      senderId: resolvedSenderId,
      text,
      timestamp: new Date(),
    });

    await conversation.save();

    res.status(200).json({ message: 'Message added', conversation });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});


// app.post('/registerSocket', (req, res) => {
//   const { email, socketId } = req.body;
//   emailToSocket[email] = socketId;
//   socketToEmail[socketId] = email;
//   console.log(`📨 Email ${email} registered to socket ${socketId}`);
//   res.sendStatus(200);
// });






app.post('/newcase', authenticateToken, async (req, res) => {
  const {title,
    type,
    description,
    location,
    datetime,
    suspect,
    evidence,
    browserloc
   } = req.body;
  const email = req.user.email;

  try {
    if (!title || !type) {
      return res.status(400).json({
        status: 400,
        message: "Case title and type are required."
      });
    }

    const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress;
    const geo = await fetch(`https://ipapi.co/${ip}/json/`).then(res => res.json());

    const case_n = new Cases({
      title:title,
      type:type,
      email:email,
      description:description,
      location:location,
      suspect:suspect,
      evidence:evidence,
      datetime:datetime,
      officer:email,
      ipAddress: ip,
      geolocation: {
        city: geo.city || "",
        region: geo.region || "",
        country: geo.country_name || "",
        latitude: geo.latitude || "",
        longitude: geo.longitude || "",
      },
      browserLocation: browserloc || {},
    });

    const user = await mongo.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found."
      });
    }

    await mongo.updateOne({ email }, { $push: { reports: title } });
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
      error: error.message, 
    });
  }
});

app.post('/common_cases', authenticateToken, async (req, res) => {
  const { title, type, description,location, datetime, suspect, evidence,browserloc } = req.body;
  const mail = req.user.email;
  

  try {
    const officers = await mongo.find({role:"police"});

    if (officers.length === 0) {
      return res.status(404).json({ status: 404, message: "No officers available" });
    }

    let selectedOfficer = officers[0];
    officers.forEach(officer => {
      if (officer.reports.length < selectedOfficer.reports.length) {
        selectedOfficer = officer;
      }
    });

    const ip =
    req.headers['x-forwarded-for']?.split(',')[0] || // If behind a proxy like nginx
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress;
    
    console.log(ip);
    const geo = await fetch(`https://ipapi.co/${ip}/json/`).then(res => res.json());


    const newCase = new commoncase({
      title:title,
      type:type,
      email: mail,
      description:description,
      location:location,
      suspect:suspect,
      evidence:evidence,
      datetime: new Date(datetime),
      officer: selectedOfficer.email,
      ipAddress: ip,
      geolocation: {
        city: geo.city || "",
        region: geo.region || "",
        country: geo.country_name || "",
        latitude: geo.latitude || "",
        longitude: geo.longitude || "",
      },
      browserLocation: browserloc || {},
    });
    
    await newCase.save();
    const chat=new Conversation({case_id:newCase._id,userIds:mail});
    await chat.save();
    selectedOfficer.reports.push(title);
    await selectedOfficer.save();

    return res.status(200).json({
      status: 200,
      message: "Case created and assigned to officer successfully",
      id:newCase._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Failed to create new case",
      error: err.message,
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

    const userReports = logeduser.reports;

    const cases = await Cases.find({ title: { $in: userReports } });
    const complaints=await commoncase.find({officer:email});
    const allcomplaints=[...cases,...complaints];
    return res.status(200).json({ status: 200, data: allcomplaints });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Error fetching cases',
      error: err.message,
    });
  }
});

app.get('/commonscases', authenticateToken, async (req, res) => {
  const email = req.user.email;

  try {
    const cases = await commoncase.find({ email });

    if (cases.length === 0) {
      return res.status(200).json({
        status: 200,
        data: [],
        message: 'No cases found for this user.',
      });
    }

    return res.status(200).json({
      status: 200,
      data: cases,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: 'Error fetching cases',
      error: err.message,
    });
  }
});


// app.post('/Upload_images', authenticateToken, upload_img.array("images"), async (req, res) => {
//   try {
//     const email = req.user.email;
//     const rawCaseId = req.body.case_id;
//     const files = req.files;

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         status: 400,
//         message: "No files uploaded",
//       });
//     }

//     // Clean case ID
//     const caseIdString = rawCaseId?.includes("#") ? rawCaseId.split("#")[1] : rawCaseId;
//     const caseId = mongoose.Types.ObjectId.isValid(caseIdString) ? caseIdString : null;

//     if (!caseId) {
//       return res.status(400).json({
//         status: 400,
//         message: "Invalid Case ID format",
//       });
//     }

//     // console.log("Uploading images for Case ID:", caseId);

//     const user = await mongo.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         status: 404,
//         message: "User not found",
//       });
//     }

//     // Prepare the image data
//     const imageData = files.map((file) => ({
//       image_id: file.filename,
//       data: file.buffer,
//       contentType: file.mimetype,
//       uploadedAt: new Date(),
//     }));

//     // Try finding the case in 'Cases' collection first
//     const existingCase = await Cases.findOne({ _id: caseId });

//     if (existingCase) {
//       await Cases.updateOne(
//         { _id: caseId },
//         { $push: { images: { $each: imageData } } }
//       );

//       return res.status(200).json({
//         status: 200,
//         message: "Files uploaded successfully to Cases",
//       });
//     }

//     // If not found in 'Cases', try 'CommonCase'
//     const existingCommonCase = await commoncase.findOne({ _id: caseId });

//     if (existingCommonCase) {
//       await commoncase.updateOne(
//         { _id: caseId },
//         { $push: { images: { $each: imageData } } }
//       );

//       return res.status(200).json({
//         status: 200,
//         message: "Files uploaded successfully to CommonCase",
//       });
//     }

//     // Case not found in either collection
//     return res.status(404).json({
//       status: 404,
//       message: "Case not found in both collections",
//     });

//   } catch (err) {
//     console.error("❌ Error during file upload:", err);
//     return res.status(500).json({
//       status: 500,
//       message: "Error during file upload",
//       error: err.message,
//     });
//   }
// });

app.post(
  '/Upload_media',
  authenticateToken,
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const email = req.user.email;
      const rawCaseId = req.body.case_id;

      // Validate files
      const images = req.files?.images || [];
      const videos = req.files?.videos || [];

      if (images.length === 0 && videos.length === 0) {
        return res.status(400).json({
          status: 400,
          message: 'No files uploaded',
        });
      }

      // Extract case ID
      const caseIdString = rawCaseId?.includes('#')
        ? rawCaseId.split('#')[1]
        : rawCaseId;
      const caseId = mongoose.Types.ObjectId.isValid(caseIdString)
        ? caseIdString
        : null;

      if (!caseId) {
        return res.status(400).json({
          status: 400,
          message: 'Invalid Case ID format',
        });
      }

      // Validate user
      const user = await mongo.findOne({ email });
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: 'User not found',
        });
      }

      // Prepare media metadata
      const mediaData = [...images, ...videos].map((file) => ({
        media_id: file.filename,
        path: file.path,
        contentType: file.mimetype,
        uploadedAt: new Date(),
      }));

      // Try saving to Cases
      const existingCase = await Cases.findOne({ _id: caseId });
      if (existingCase) {
        await Cases.updateOne(
          { _id: caseId },
          { $push: { media: { $each: mediaData } } }
        );
        return res.status(200).json({
          status: 200,
          message: 'Files uploaded successfully to Cases',
        });
      }

      // Try saving to CommonCase
      const existingCommonCase = await commoncase.findOne({ _id: caseId });
      if (existingCommonCase) {
        await commoncase.updateOne(
          { _id: caseId },
          { $push: { media: { $each: mediaData } } }
        );
        return res.status(200).json({
          status: 200,
          message: 'Files uploaded successfully to CommonCase',
        });
      }

      return res.status(404).json({
        status: 404,
        message: 'Case not found in both collections',
      });

    } catch (err) {
      console.error('❌ Error during file upload:', err);
      return res.status(500).json({
        status: 500,
        message: 'Error during file upload',
        error: err.message,
      });
    }
  }
);


app.get('/filer/:caseId', async (req, res) => {
  const caseId  = req.params.caseId;

  try {
    const objectId = new mongoose.Types.ObjectId(caseId);
    const filer_mail = await commoncase.findById({_id:objectId}); // use findById for single doc

    if (filer_mail) {
      return res.status(200).json({
        status: 200,
        email: filer_mail.email,
        message: "Got case"
      });
    }

    return res.json({
      status: 404,
      message: "Case not found"
    });

  } catch (err) {
    console.error("Error fetching filer mail:", err);
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching case"
    });
  }
});


app.get('/get_case_images/:caseId', async (req, res) => {
     const  case_id  = req.params.caseId;

    const objectId = new mongoose.Types.ObjectId(case_id);
  
    try {
      // Try to find the case in the Cases collection
      const caseDoc = await Cases.findOne({ _id:objectId });
  
      if (!caseDoc) {
        // If the case is not found in the Cases collection, check the commoncase collection
        const uDoc = await commoncase.findOne({ _id:objectId });
        
        if (!uDoc) {
          return res.status(404).json({
            status: 404,
            message: "Case not found"
          });
        }
  
        // If case found in commoncase, retrieve images
        const images = uDoc.media;
  
        if (images.length === 0) {
          return res.status(200).json({
            status: 404,
            message: "No images found for this case",
          });
        }
  
        // Map the image data to the desired format
        const imageData = images.map((image) => ({
          image_id: image.image_id,  // Image's unique identifier
          imageUrl: `${image.media_id}`,  // URL to the image
          contentType: image.contentType,
          uploadedAt: image.uploadedAt,
          officer:uDoc.officer
        }));
  
        return res.status(200).json({
          status: 200,
          message: "Images retrieved successfully",
          images: imageData
        });
      }
  
      // If the case is found in the Cases collection, retrieve the images
      const images = caseDoc.media;
  
      if (images.length === 0) {
        return res.status(200).json({
          status: 404,
          message: "No images found for this case"
        });
      }
  
      // Map the image data to the desired format
      const imageData = images.map((image) => ({
        image_id: image.image_id,
        imageUrl: `${image.media_id}`,  // URL for the image
        contentType: image.contentType,
        uploadedAt: image.uploadedAt,
        officer:caseDoc.officer
      }));
  
      // Send the image data back in the response
      return res.status(200).json({
        status: 200,
        message: "Images retrieved successfully",
        images: imageData
      });
    } catch (err) {
      console.error("Error retrieving images:", err);
      return res.status(500).json({
        status: 500,
        message: "Error retrieving images",
        error: err.message
      });
    }
  });

  app.get('/images/:imageUrl', (req, res) => {
    const { imageUrl } = req.params;
    const imageFilePath = path.join(__dirname, 'uploads', imageUrl);
  
    fs.stat(imageFilePath, (err, stats) => {
      if (err || !stats.isFile()) {
        return res.status(404).json({ message: 'File not found' });
      }
  
      // Dynamically get mime type based on file extension
      const mimeType = mime.getType(imageFilePath) || 'application/octet-stream';
      res.contentType(mimeType);
  
      // Stream file to response (better for large files)
      const readStream = fs.createReadStream(imageFilePath);
      readStream.pipe(res);
    });
  });

app.get('/reference/:caseId', async (req, res) => {
  const case_id = req.params.caseId;
  const objectId = new mongoose.Types.ObjectId(case_id);

  try {
    let caseData = await Cases.findOne({ _id: objectId }) || await commoncase.findOne({ _id: objectId });

    if (!caseData) {
      return res.json({
        status: 401,
        message: "No case found"
      });
    }

    const type = caseData.type;

    try {
      const ptype = await Cases.find({ type, status: "finished" });
      const pptype = await commoncase.find({ type, status: "finished" });

      if (ptype.length === 0 && pptype.length === 0) {
        return res.json({
          status: 200,
          message: "No Cases of this type found in both",
          cases: null
        });
      }

      if (ptype.length === 0) {
        return res.json({
          status: 200,
          message: "Found cases",
          cases: pptype
        });
      }

      if (pptype.length === 0) {
        return res.json({
          status: 200,
          message: "Found cases",
          cases: ptype
        });
      }

      const combine = [...ptype, ...pptype];
      return res.json({
        status: 200,
        message: "Cases found",
        cases: combine
      });

    } catch (err) {
      console.error("Error while fetching similar cases:", err);
      return res.json({
        status: 500,
        message: "Error with database"
      });
    }

  } catch (err) {
    console.error("Error while fetching case by ID:", err);
    return res.json({
      status: 500,
      message: "Error with database"
    });
  }
});

app.get('/emails/:caseId', async (req, res) => {
  const case_id = req.params.caseId;

  // Validate the ID format before converting
  if (!mongoose.Types.ObjectId.isValid(case_id)) {
    return res.json({
      status: 400,
      message: "Invalid case ID format",
    });
  }

  const objectId = new mongoose.Types.ObjectId(case_id);

  try {
    const mails = await commoncase.findOne({ _id: objectId });
    if (!mails) {
      return res.json({
        status: 404,
        message: "Case not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Email found",
      officer: mails.officer,
      email: mails.email,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
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
    const police_true=police_ids[email];
    if(police_true===undefined){
      const newUser = new mongo({ email, password: hashedPassword,role:"common" });
      await newUser.save();
      return res.json({ status: 200, message: "User created successfully" });
    }
    const newUser = new mongo({ email, password: hashedPassword,role:"police" });
    await newUser.save();
    return res.json({ status: 200, message: "User created successfully" });

  } catch (error) {
    console.error('❌ Signup Error:', error);
    return res.json({ status: 500, message: "Failed to signup" });
  }
});


app.post('/login', async (req, res) => {
  const { email, password, login } = req.body;

  if (login) {
    try {
      const user = await mongo.findOne({ email });
      if (!user) {
        // Send email when the user is not found
        await sendEmail(email, "Login failed: User not found");
        return res.status(410).json({ status: 410, message: 'User not found' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        });
        

        const otpCode = generateOtp();
        otp.mailcode=otpCode;
        await sendEmail(email, otpCode);
      
        return res.status(200).json({ status: 200, message: 'Login successful', token });
        
      } else {
        // Send email when password is incorrect
        await sendEmail(email, "Login failed: Incorrect password");
        return res.status(401).json({ status: 401, message: 'Invalid password' });
      }

    } catch (error) {
      console.error("❌ Error finding user:", error);
      // Send email on error
      await sendEmail(email, "Error during login process");
      return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
  }

  // If OTP resend logic is triggered
  if (!login) {
    const otpCode = generateOtp();
    otp.mailcode=otpCode;
    try {
      await sendEmail(email, otpCode);
      return res.json({
        status: 200,
        message: "OTP Resent Successfully"
      });
    } catch (err) {
      return res.json({
        status: 404,
        message: "Error sending mail"
      });
    }
  }
});

app.post('/allanalyse',authenticateToken,async(req,res)=>{
    const email=req.user.email;
    const case_id=req.body.caseId;
    try{
      const getimg=await commoncase.findOne({_id:case_id});
      if(!getimg){
        const getimg_cases=await Cases.findOne({_id:case_id});
        if(!getimg_cases){
          return res.json({
            status:401,
            message:"No Case Found"
          })
        }
        const imagePaths = getimg_cases.images.map(img => img.image_id);


        
        
      }
      const imagePaths = getimg.images.map(img => img.image_id);


    }catch(err){
      console.log(err);
    }
})

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


app.get('/usermail',authenticateToken,(req,res)=>{
  
  const usermail=req.user;
  res.json({
    status:200,
    mail:usermail
  })
})
  




































module.exports=app;

// app.listen(5500, () => {
//   console.log('🚀 Server started on port 5500');
// });
