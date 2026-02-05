const mongoose = require('mongoose');

const FlagRequestSchema = new mongoose.Schema({
  targetType: { type: String, enum: ['ngo', 'campaign'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetName: { type: String },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('FlagRequest', FlagRequestSchema);
