const mongoose = require('./db'); // Use the same instance

const commoncaseSchema = new mongoose.Schema({
  title: String,
  type: String,
  email: String,
  description: String,
  location: String, // Can be detailed location from frontend
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
  media: [
    {
      media_id: String,
      path: String,
      contentType: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  officer: String,

  ipAddress: String,
  geolocation: {
    city: String,
    region: String,
    country: String,
    latitude: Number,
    longitude: Number
  },
  browserLocation: {
    latitude: Number,
    longitude: Number
  },
  filedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('CommonCase', commoncaseSchema);
