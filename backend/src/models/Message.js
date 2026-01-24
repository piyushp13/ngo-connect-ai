const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toNGO: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  body: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', MessageSchema);
