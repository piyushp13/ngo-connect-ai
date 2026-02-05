const mongoose = require('mongoose');

const VolunteerOpportunitySchema = new mongoose.Schema({
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: String,
  skills: [String],
  commitment: {
    type: String,
    enum: ['One-time', 'Weekly', 'Monthly', 'Flexible'],
    default: 'Flexible'
  },
  dateRange: {
    startDate: Date,
    endDate: Date
  },
  spots: { type: Number, default: 10 },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VolunteerOpportunity', VolunteerOpportunitySchema);

