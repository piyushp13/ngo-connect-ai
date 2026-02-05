const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get notifications for logged-in user/ngo/admin
router.get('/', auth(['user', 'ngo', 'admin']), async (req, res) => {
  try {
    const role = req.user.role;
    let audienceFilter = ['all'];
    if (role === 'user') audienceFilter.push('users');
    if (role === 'ngo') audienceFilter.push('ngos');
    if (role === 'admin') audienceFilter = ['all', 'users', 'ngos'];

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const notifications = await Notification.find({ audience: { $in: audienceFilter } })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
