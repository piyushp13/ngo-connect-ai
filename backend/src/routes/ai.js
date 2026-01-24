const express = require('express');
const router = express.Router();
const AILog = require('../models/AILog');
const NGO = require('../models/NGO');
const Campaign = require('../models/Campaign');
const User = require('../models/User');

// Rule-based recommendation: simple scoring
router.post('/recommend-ngos', async (req, res) => {
  try {
    const { userId, location, interests } = req.body;
    const user = userId ? await User.findById(userId) : null;
    const ngos = await NGO.find({ verified: true });
    const scored = ngos.map(n => {
      let score = 0;
      if (location && n.location && n.location.toLowerCase().includes(location.toLowerCase())) score += 3;
      if (user && user.interests) {
        const common = user.interests.filter(i => (n.category || '').toLowerCase().includes(i.toLowerCase()));
        score += common.length * 2;
      }
      // small random to diversify
      score += Math.random();
      return { ngo: n, score };
    });
    scored.sort((a, b) => b.score - a.score);
    await AILog.create({ type: 'recommend', payload: { userId, location, interests }, result: scored.slice(0, 10).map(s => ({ id: s.ngo._id, score: s.score })) });
    res.json(scored.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple NLP classification using keywords
router.post('/classify-campaign', async (req, res) => {
  try {
    const { description } = req.body;
    const text = (description || '').toLowerCase();
    let category = 'Other';
    if (text.match(/school|education|teach|students/)) category = 'Education';
    else if (text.match(/health|hospital|clinic|doctor/)) category = 'Health';
    else if (text.match(/food|hunger|meals|feed/)) category = 'Food';
    else if (text.match(/disaster|flood|earthquake/)) category = 'Disaster Relief';
    else if (text.match(/environment|plant|tree|clean/)) category = 'Environment';
    await AILog.create({ type: 'classify', payload: { description }, result: { category } });
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Chatbot (rule-based)
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const m = (message || '').toLowerCase();
    let reply = "I'm NGO Connect bot. Ask me how to use the platform, about NGO registration, or request recommendations.";
    if (m.includes('register')) reply = 'To register, go to Register page and pick User or NGO. NGOs must upload verification docs.';
    else if (m.includes('recommend')) reply = 'I can recommend NGOs. Provide your interests and location or ask for suggestions.';
    else if (m.includes('ngo')) reply = 'NGOs can create profiles, post campaigns, and upload docs for verification.';
    await AILog.create({ type: 'chat', payload: { message }, result: { reply } });
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fraud scoring
router.post('/fraud-score', async (req, res) => {
  try {
    const { ngoId } = req.body;
    const ngo = await NGO.findById(ngoId);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    let score = 0;
    if (!ngo.verificationDocs || ngo.verificationDocs.length === 0) score += 40;
    const ageDays = (Date.now() - new Date(ngo.createdAt).getTime()) / (1000 * 3600 * 24);
    if (ageDays < 30) score += 20;
    if ((ngo.description || '').toLowerCase().match(/urgent|donate now|click here/)) score += 30;
    // mock high donation goal detection via campaigns
    const campaigns = await Campaign.find({ ngo: ngo._id });
    const highGoal = campaigns.some(c => (c.goalAmount || 0) >= 100000);
    if (highGoal) score += 20;
    const flagged = score >= 50;
    await AILog.create({ type: 'fraud', payload: { ngoId }, result: { score, flagged } });
    res.json({ score, flagged });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Volunteer matching
router.post('/match-volunteers', async (req, res) => {
  try {
    const { campaignId } = req.body;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    const users = await User.find();
    const scored = users.map(u => {
      let score = 0;
      if (u.location && campaign.location && u.location.toLowerCase().includes(campaign.location.toLowerCase())) score += 3;
      if (u.skills && campaign.volunteersNeeded) {
        const common = u.skills.filter(s => campaign.volunteersNeeded.includes(s));
        score += common.length * 2;
      }
      if (u.availability) score += 1;
      return { user: u, score };
    });
    scored.sort((a, b) => b.score - a.score);
    await AILog.create({ type: 'match', payload: { campaignId }, result: scored.slice(0, 10).map(s => ({ id: s.user._id, score: s.score })) });
    res.json(scored.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
