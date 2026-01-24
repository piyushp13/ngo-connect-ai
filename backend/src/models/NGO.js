const mongoose = require('mongoose');
const NGOSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  category: String,
  description: String,
  location: String,
  verified: { type: Boolean, default: false },
  verificationDocs: [String],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('NGO', NGOSchema);
