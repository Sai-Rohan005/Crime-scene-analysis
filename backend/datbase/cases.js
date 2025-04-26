const mongoose = require('./db');

const caseSchema = new mongoose.Schema({
  caseTitle: { type: String, required: true, unique: true },
  caseType: { type: String, required: true },
  email: { type: String, required: true },
  images: [
    {
      image_id: String,
      data: Buffer,
      contentType: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cases', caseSchema);
