const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// List all users (admin only, or for messaging contact list)
router.get('/', auth(['admin', 'user', 'ngo']), async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user preferences
router.get('/preferences', auth(['user']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.preferences || {});
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth(['user']), async (req, res) => {
  try {
    const { location, preferredLocations, interests, causes, skills, donationRange, causesCareAbout, hasDonated, hasVolunteered } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize preferences object if it doesn't exist
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update preferences fields
    if (location !== undefined) user.preferences.location = location;
    if (preferredLocations !== undefined) user.preferences.preferredLocations = preferredLocations;
    if (interests !== undefined) user.preferences.interests = interests;
    if (causes !== undefined) user.preferences.causes = causes;
    if (skills !== undefined) user.preferences.skills = skills;
    if (donationRange !== undefined) user.preferences.donationRange = donationRange;
    if (causesCareAbout !== undefined) user.preferences.causesCareAbout = causesCareAbout;
    if (hasDonated !== undefined) user.preferences.hasDonated = hasDonated;
    if (hasVolunteered !== undefined) user.preferences.hasVolunteered = hasVolunteered;

    await user.save();
    res.json({ message: 'Preferences updated successfully', preferences: user.preferences });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
