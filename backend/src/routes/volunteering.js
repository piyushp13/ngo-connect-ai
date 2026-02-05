const express = require('express');
const router = express.Router();
const VolunteerOpportunity = require('../models/VolunteerOpportunity');
const auth = require('../middleware/auth');

// Get all volunteer opportunities
router.get('/', async (req, res) => {
  try {
    const { category, location, skills } = req.query;
    const filter = {};
    if (location) filter.location = new RegExp(location, 'i');
    if (skills) filter.skills = { $in: skills.split(',') };
    
    const opportunities = await VolunteerOpportunity.find(filter)
      .populate('ngo', 'name logo location verified')
      .sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get opportunities where user has volunteered
router.get('/my', auth(['user', 'ngo', 'admin']), async (req, res) => {
  try {
    const opportunities = await VolunteerOpportunity.find({ applicants: req.user.id })
      .populate('ngo', 'name logo');
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get opportunities posted by an NGO
router.get('/ngo/:id', async (req, res) => {
  try {
    const opportunities = await VolunteerOpportunity.find({ ngo: req.params.id })
      .sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create volunteer opportunity (NGO only)
router.post('/', auth(['ngo']), async (req, res) => {
  try {
    const data = req.body;
    data.ngo = req.user.id;
    const opportunity = await VolunteerOpportunity.create(data);
    res.json(opportunity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply to volunteer (User only)
router.post('/:id/apply', auth(['user']), async (req, res) => {
  try {
    const opportunity = await VolunteerOpportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    
    if (!opportunity.applicants.includes(req.user.id)) {
      opportunity.applicants.push(req.user.id);
      await opportunity.save();
    }
    res.json({ message: 'Successfully applied to volunteer!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw volunteer application
router.delete('/:id/withdraw', auth(['user']), async (req, res) => {
  try {
    const opportunity = await VolunteerOpportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    
    opportunity.applicants = opportunity.applicants.filter(
      id => id.toString() !== req.user.id
    );
    await opportunity.save();
    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete opportunity (NGO only)
router.delete('/:id', auth(['ngo']), async (req, res) => {
  try {
    const opportunity = await VolunteerOpportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    
    if (opportunity.ngo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await VolunteerOpportunity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Opportunity deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

