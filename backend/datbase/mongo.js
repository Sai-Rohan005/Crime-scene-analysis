const mongoose = require('./db');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  username: String,
  createdon: Date,
  profile: String,
  reports: [String]
});

module.exports = mongoose.model('User', userSchema);
