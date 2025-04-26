const mongoose = require('./db');

const conversationSchema = new mongoose.Schema({
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [
    {
      index: Number,
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
