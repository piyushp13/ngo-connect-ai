const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'ngo', 'admin'], default: 'user' },
  interests: [String],
  location: String,
  skills: [String],
  availability: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);
