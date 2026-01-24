const mongoose = require('mongoose');
const DonationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
  amount: Number,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Donation', DonationSchema);
