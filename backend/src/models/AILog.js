const mongoose = require('mongoose');
const AILogSchema = new mongoose.Schema({
  type: String,
  payload: mongoose.Schema.Types.Mixed,
  result: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AILog', AILogSchema);
