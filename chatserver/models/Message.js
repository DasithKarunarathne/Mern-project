const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  isBot: Boolean,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);