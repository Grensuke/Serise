const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: '' },
  participants: { type: String, default: '' },
  summary: { type: String, required: true },
  transcript: { type: String, default: '' },
  analysis: { type: Object },
  mood: { type: String, default: 'calm' },
  tags: [{ type: String }],
  actionItems: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Conversation', ConversationSchema);
