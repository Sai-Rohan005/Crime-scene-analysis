const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/differentcases", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("📡 MongoDB connected successfully");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Define the schema for Cases
const caseSchema = new mongoose.Schema({
  caseTitle: {
    type: String,
    required: true,
    unique: true, 
  },
  caseType: {
    type: String,
    required: true,
  },
  email:{
    type:String,
    required:true,
  },
  reports: { 
    type: [String],
    default: [],  
  }
}, { timestamps: true });  


const Cases = mongoose.model('Cases', caseSchema);


module.exports = Cases;
