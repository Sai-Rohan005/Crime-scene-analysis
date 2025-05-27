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
  officer:String,
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

}, { timestamps: true });

module.exports = mongoose.model('Cases', caseSchema);
