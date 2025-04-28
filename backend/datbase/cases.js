const mongoose = require('./db');

const caseSchema = new mongoose.Schema({
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
}, { timestamps: true });

module.exports = mongoose.model('Cases', caseSchema);
