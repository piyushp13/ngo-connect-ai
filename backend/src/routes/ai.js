const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const AILog = require('../models/AILog');
const NGO = require('../models/NGO');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const {
  normalizeRole,
  escapeRegExp,
  selectKbEntries,
  normalizeHistory,
  buildPrompt,
  buildFallbackReply
} = require('../utils/supportChat');

// Initialize Google Generative AI
let genAI;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_API_KEY_HERE") {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn("GEMINI_API_KEY not found or is a placeholder. Chatbot will use fallback responses.");
}

// Rule-based recommendation: simple scoring
router.post('/recommend-ngos', async (req, res) => {
  try {
    const { userId, location, interests } = req.body;
    const user = userId ? await User.findById(userId) : null;
    const ngos = await NGO.find({ verified: true });
    const scored = ngos.map(n => {
      let score = 0;
      if (location && n.location && typeof n.location === 'string' && n.location.toLowerCase().includes(location.toLowerCase())) score += 3;
      if (user && user.interests) {
        const common = user.interests.filter(i => (n.category || '').toLowerCase().includes(i.toLowerCase()));
        score += common.length * 2;
      }
      // small random to diversify
      score += Math.random();
      return { ngo: n, score };
    });
    scored.sort((a, b) => b.score - a.score);
    await AILog.create({ type: 'recommend', payload: { userId, location, interests }, result: scored.slice(0, 10).map(s => ({ id: s.ngo.id, score: s.score })) });
    res.json(scored.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/recommendations', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user preferences (either from preferences object or fallback to basic fields)
    const userInterests = user.preferences?.interests || user.interests || [];
    const userLocation = user.preferences?.location || user.location || '';
    const userSkills = user.preferences?.skills || user.skills || [];
    const preferredLocations = user.preferences?.preferredLocations || [];
    const causes = user.preferences?.causes || user.preferences?.causesCareAbout || [];
    
    // Get verified NGOs and active campaigns
    const ngos = await NGO.find({ verified: true, isActive: true });
    const campaigns = await Campaign.find().populate('ngo', 'name logo location verified isActive');
    const validCampaigns = campaigns.filter(
      c => c.ngo && c.ngo.id && c.ngo.verified !== false && c.ngo.isActive !== false
    );

    // Scoring and matching for NGOs
    const scoredNgos = ngos.map(ngo => {
      let score = 0;
      let reasons = [];

      // Location matching (highest priority)
      const userLocations = [userLocation, ...preferredLocations].filter(Boolean);
      if (userLocations.length > 0) {
        // Check geographies
        if (ngo.geographies && ngo.geographies.length > 0) {
          userLocations.forEach(loc => {
            if (ngo.geographies.some(g => g.toLowerCase().includes(loc.toLowerCase()))) {
              score += 5;
              reasons.push('Matches your location');
            }
          });
        }
        // Check location field
        if (typeof ngo.location === 'string' && userLocations.some(loc => ngo.location.toLowerCase().includes(loc.toLowerCase()))) {
          score += 4;
          reasons.push('Works in your area');
        }
      }

      // Interest/cause matching
      const allUserInterests = [...new Set([...userInterests, ...causes])];
      if (allUserInterests.length > 0) {
        // Match with primary sectors
        if (ngo.primarySectors && ngo.primarySectors.length > 0) {
          const commonPrimary = allUserInterests.filter(i => 
            ngo.primarySectors.some(s => s.toLowerCase().includes(i.toLowerCase()))
          );
          score += commonPrimary.length * 3;
          commonPrimary.forEach(i => reasons.push(`Focuses on ${i}`));
        }
        // Match with secondary sectors
        if (ngo.secondarySectors && ngo.secondarySectors.length > 0) {
          const commonSecondary = allUserInterests.filter(i => 
            ngo.secondarySectors.some(s => s.toLowerCase().includes(i.toLowerCase()))
          );
          score += commonSecondary.length * 1;
        }
        // Match with category
        if (ngo.category && allUserInterests.some(i => ngo.category.toLowerCase().includes(i.toLowerCase()))) {
          score += 2;
          reasons.push('Aligned with your interests');
        }
      }

      // Skills matching (for volunteering)
      if (userSkills.length > 0) {
        if (ngo.primarySectors) {
          const matchingSkills = userSkills.filter(skill => 
            ngo.primarySectors.some(s => s.toLowerCase().includes(skill.toLowerCase()))
          );
          score += matchingSkills.length * 1.5;
          if (matchingSkills.length > 0) {
            reasons.push('Needs your skills');
          }
        }
      }

      // Verified NGOs get bonus
      if (ngo.verified) {
        score += 2;
      }

      // Add a small random factor to break ties
      score += Math.random() * 0.5;

      return { ngo, score, reasons: [...new Set(reasons)].slice(0, 3) };
    });

    scoredNgos.sort((a, b) => b.score - a.score);
    const recommendedNgos = scoredNgos.slice(0, 10);

    // Scoring and matching for Campaigns
    const scoredCampaigns = validCampaigns.map(campaign => {
      let score = 0;
      let reasons = [];

      // Location matching
      if (userLocation && campaign.location) {
        if (campaign.location.toLowerCase().includes(userLocation.toLowerCase())) {
          score += 5;
          reasons.push('In your location');
        }
      }

      // Category matching
      const allUserInterests = [...new Set([...userInterests, ...causes])];
      if (allUserInterests.length > 0 && campaign.category) {
        if (allUserInterests.some(i => campaign.category.toLowerCase().includes(i.toLowerCase()))) {
          score += 4;
          reasons.push(`In ${campaign.category}`);
        }
      }

      // NGO credibility (based on parent NGO's score)
      const ngoMatch = campaign.ngo
        ? scoredNgos.find(n => n.ngo.id.toString() === campaign.ngo.id.toString())
        : null;
      if (ngoMatch) {
        score += ngoMatch.score * 0.3;
        reasons.push(...ngoMatch.reasons.slice(0, 2));
      }

      // Progress bonus (campaigns closer to goal)
      if (campaign.goalAmount > 0) {
        const progress = campaign.currentAmount / campaign.goalAmount;
        if (progress >= 0.75) {
          score += 2; // Almost funded
          reasons.push('Almost funded');
        } else if (progress >= 0.5) {
          score += 1;
        }
      }

      // Small random factor
      score += Math.random() * 0.5;

      return { campaign, score, reasons: [...new Set(reasons)].slice(0, 3) };
    });

    scoredCampaigns.sort((a, b) => b.score - a.score);
    const recommendedCampaigns = scoredCampaigns.slice(0, 10);

    // Log the recommendation
    await AILog.create({ 
      type: 'recommendations', 
      payload: { 
        userId: user.id,
        preferences: {
          location: userLocation,
          interests: userInterests,
          skills: userSkills
        }
      }, 
      result: { 
        ngoCount: recommendedNgos.length,
        campaignCount: recommendedCampaigns.length
      }
    });

    res.json({
      ngos: recommendedNgos,
      campaigns: recommendedCampaigns
    });
  } catch (err) {
    console.error('Error in /recommendations:', err);
    res.status(500).send('Server Error');
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

// Chatbot (LLM-powered)
router.post('/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.json({ reply: 'Please type a message and try again.' });
    }

    const m = message.toLowerCase();
    const history = normalizeHistory(req.body?.history || []);

    const clientContext = req.body?.clientContext && typeof req.body.clientContext === 'object'
      ? req.body.clientContext
      : null;

    let role = normalizeRole(clientContext?.role);
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        role = normalizeRole(payload?.role);
      } catch (err) {
        // Ignore invalid token for chat; fall back to guest-safe behavior.
        role = role || 'guest';
      }
    }

    const kbEntries = selectKbEntries(message);
    
    const buildDbContext = async () => {
      const parts = [];

	      const addNgoContext = async (label, filter) => {
	        const ngos = await NGO.find(filter).limit(20).select('name description category location isActive');
	        const visible = (ngos || []).filter((ngo) => ngo && ngo.isActive !== false).slice(0, 5);
	        if (visible.length === 0) return;
	        parts.push(`NGOs ${label}:`);
	        parts.push(...visible.map((n) => `- ${n.name}: ${(n.description || '').slice(0, 160)} (Category: ${n.category || 'N/A'}, Location: ${n.location || 'N/A'})`));
	      };

      const addCampaignContext = async (label, filter) => {
        const campaigns = await Campaign.find(filter)
          .populate('ngo', 'name verified isActive')
          .limit(5)
          .select('title description category location goalAmount currentAmount');
        const visible = (campaigns || []).filter((c) => c.ngo && c.ngo.verified !== false && c.ngo.isActive !== false);
        if (visible.length === 0) return;
        parts.push(`Campaigns ${label}:`);
        parts.push(...visible.map((c) => {
          const goal = Number(c.goalAmount || 0);
          const current = Number(c.currentAmount || 0);
          const pct = goal > 0 ? Math.round((current / goal) * 100) : 0;
          return `- ${c.title}: ${c.category || 'Campaign'} (${c.location || 'N/A'}) by ${c.ngo?.name || 'NGO'} | ₹${current} raised${goal ? ` of ₹${goal} (${pct}%)` : ''}`;
        }));
      };

      // Location-based queries: "... in <location>"
      if (m.includes(' in ')) {
        const partsRaw = m.split(' in ');
        const potentialLocation = partsRaw[partsRaw.length - 1].replace('?', '').trim();
        const escaped = escapeRegExp(potentialLocation);
        if (escaped && escaped.length >= 2) {
	          const rx = new RegExp(escaped, 'i');
	          await Promise.all([
	            addNgoContext(`in "${potentialLocation}"`, { verified: true, location: rx }),
	            addCampaignContext(`in "${potentialLocation}"`, { location: rx })
	          ]);
	        }
	      }

      // Category-based queries: "... for/about <category>"
      if (m.includes(' for ') || m.includes(' about ')) {
        const partsRaw = m.split(/ for | about /);
        const potentialCategory = partsRaw[partsRaw.length - 1].replace('?', '').trim();
        const escaped = escapeRegExp(potentialCategory);
        if (escaped && escaped.length >= 2) {
	          const rx = new RegExp(escaped, 'i');
	          await Promise.all([
	            addNgoContext(`related to "${potentialCategory}"`, { verified: true, category: rx }),
	            addCampaignContext(`related to "${potentialCategory}"`, { category: rx })
	          ]);
	        }
	      }

      return parts.join('\n');
    };

    // --- Basic RAG (Retrieval-Augmented Generation) ---
    const dbContext = await buildDbContext();

    if (!genAI) {
      const reply = buildFallbackReply({ message, role, kbEntries });
      await AILog.create({ type: 'chat', payload: { message, role, historyCount: history.length }, result: { reply, mode: 'fallback' } });
      return res.json({ reply, mode: 'fallback' });
    }

    const model = genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash' },
      { apiVersion: 'v1beta' }
    );

    const prompt = buildPrompt({
      message,
      role,
      kbEntries,
      dbContext,
      history,
      clientContext
    });

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const reply = response.text();

      await AILog.create({ type: 'chat', payload: { message, role, historyCount: history.length }, result: { reply, mode: 'gemini' } });
      return res.json({ reply, mode: 'gemini' });
    } catch (llmErr) {
      const reply = buildFallbackReply({ message, role, kbEntries });
      await AILog.create({ type: 'chat', payload: { message, role, historyCount: history.length }, result: { reply, mode: 'fallback-after-error' } });
      return res.json({ reply, mode: 'fallback' });
    }

  } catch (err) {
    console.error("Chatbot API error:", err);
    res.json({ reply: 'Sorry, I ran into an issue. Please try again.' });
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
    const campaigns = await Campaign.find({ ngo: ngo.id });
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
    await AILog.create({ type: 'match', payload: { campaignId }, result: scored.slice(0, 10).map(s => ({ id: s.user.id, score: s.score })) });
    res.json(scored.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
