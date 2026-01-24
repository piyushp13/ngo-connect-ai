const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Send message to NGO (user)
router.post('/to-ngo/:ngoId', auth(['user']), async (req, res) => {
  try {
    const msg = await Message.create({ from: req.user.id, toNGO: req.params.ngoId, body: req.body.body });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// NGO view messages
router.get('/ngo', auth(['ngo']), async (req, res) => {
  try {
    const msgs = await Message.find({ toNGO: req.user.id }).populate('from', 'name email');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
