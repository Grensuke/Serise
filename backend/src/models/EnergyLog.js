const mongoose = require('mongoose');

const EnergyLog = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level: Number,
  activities: [String],
  note: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EnergyLog', EnergyLog);
