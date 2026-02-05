const express = require('express');
const router = express.Router();
const NGO = require('../models/NGO');
const FlagRequest = require('../models/FlagRequest');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public list verified NGOs + search by category/location
router.get('/', async (req, res) => {
  try {
    const { category, location, q } = req.query;
    const filter = { verified: true };
    if (category) filter.category = category;
    if (location) filter.location = new RegExp(location, 'i');
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    const ngos = await NGO.find(filter);
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// NGO get their own profile
router.get('/me', auth(['ngo']), async (req, res) => {
  try {
    console.log('User in /ngos/me:', req.user);
    const ngo = await NGO.findById(req.user.id);
    console.log('NGO found:', ngo);
    if (!ngo) return res.status(404).json({ message: 'NGO not found', ngo: null });
    res.json(ngo);
  } catch (err) {
    console.error('Error in /ngos/me:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Flag NGO (user/ngo/admin)
router.post('/:id/flag', auth(['admin']), async (req, res) => {
  try {
    const { reason } = req.body;
    const ngo = await NGO.findByIdAndUpdate(
      req.params.id,
      { flagged: true, flagReason: reason || 'Flagged by user' },
      { new: true }
    );
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json({ message: 'NGO flagged', ngo });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User requests admin to flag NGO
router.post('/:id/flag-request', auth(['user']), async (req, res) => {
  try {
    const { reason } = req.body;
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    if (ngo.flagged) return res.status(400).json({ message: 'NGO already flagged' });

    const existing = await FlagRequest.findOne({
      targetType: 'ngo',
      targetId: ngo._id,
      requestedBy: req.user.id,
      status: 'pending'
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this NGO' });
    }

    const request = await FlagRequest.create({
      targetType: 'ngo',
      targetId: ngo._id,
      targetName: ngo.name,
      reason: reason || 'Reported by user',
      requestedBy: req.user.id
    });
    res.json({ message: 'Flag request submitted', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// NGO updates (only ngo role)
router.put('/me', auth(['ngo']), async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json(ngo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload verification docs
router.post('/me/verify', auth(['ngo']), upload.array('docs', 5), async (req, res) => {
  try {
    const paths = req.files.map(f => f.path);
    const ngo = await NGO.findByIdAndUpdate(req.user.id, { $push: { verificationDocs: { $each: paths } } }, { new: true });
    res.json({ message: 'Documents uploaded', ngo });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// NGO profile (public if verified)
router.get('/:id', async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'Not found' });
    if (!ngo.verified) return res.status(403).json({ message: 'NGO not verified' });
    res.json(ngo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
