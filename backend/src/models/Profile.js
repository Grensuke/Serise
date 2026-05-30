const mongoose = require('mongoose');

const Profile = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  bio: { type: String, default: '', maxlength: 500 },
  strengths: [String],
  triggers: [String],
});

module.exports = mongoose.model('Profile', Profile);
