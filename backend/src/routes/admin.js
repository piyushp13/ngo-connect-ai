const express = require('express');
const router = express.Router();
const NGO = require('../models/NGO');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Only admin
router.get('/ngo-registrations', auth(['admin']), async (req, res) => {
  const ngos = await NGO.find({ verified: false });
  res.json(ngos);
});

router.post('/verify-ngo/:id', auth(['admin']), async (req, res) => {
  const ngo = await NGO.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
  res.json({ message: 'NGO verified', ngo });
});

router.post('/reject-ngo/:id', auth(['admin']), async (req, res) => {
  await NGO.findByIdAndDelete(req.params.id);
  res.json({ message: 'NGO rejected and deleted' });
});

router.delete('/user/:id', auth(['admin']), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;
