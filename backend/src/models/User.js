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
  createdAt: { type: Date, default: Date.now },
  
  // AI-Powered Recommendations Preferences
  preferences: {
    location: String,
    preferredLocations: [String],
    interests: [String],
    causes: [String],
    skills: [String],
    donationRange: {
      min: Number,
      max: Number
    },
    causesCareAbout: [String],
    hasDonated: Boolean,
    hasVolunteered: Boolean
  }
});
module.exports = mongoose.model('User', UserSchema);
