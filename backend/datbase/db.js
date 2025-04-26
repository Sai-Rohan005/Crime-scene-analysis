// datbase/db.js
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/differentcases", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => console.log("📡 MongoDB connected successfully"));
db.on('error', (err) => console.error("❌ MongoDB connection error:", err));

module.exports = mongoose;
