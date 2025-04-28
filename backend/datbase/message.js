const mongoose = require('./db');

const conversationSchema = new mongoose.Schema({
  case_id:String,
  userIds: String,
  messages: [
    {
      index: Number,
      senderId: String,
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
