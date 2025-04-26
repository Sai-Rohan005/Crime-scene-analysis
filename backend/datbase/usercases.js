const mongoose = require('./db'); // Use the same instance

const commoncaseSchema = new mongoose.Schema({
  title: String,
  type: String,
  email: String,
  description: String,
  location: String,
  suspect: String,
  evidence: String,
  datetime: Date,
  images: [
    {
      image_id: String,
      data: Buffer,
      contentType: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  officer:String
});

module.exports = mongoose.model('CommonCase', commoncaseSchema);
