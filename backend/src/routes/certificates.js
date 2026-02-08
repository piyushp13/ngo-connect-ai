const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const auth = require('../middleware/auth');
const { renderCertificateHtml, toCertificateSlug } = require('../utils/certificateTemplates');

const normalizeCertificateStatus = (certificate) => {
  const raw = String(certificate?.status || '').trim().toLowerCase();
  return raw || 'active';
};

const getCertificateForUser = async (certificateId, userId) => {
  const certificate = await Certificate.findOne({ id: certificateId, user: userId })
    .populate('ngo', 'name')
    .populate('campaign', 'title')
    .populate('donation', 'amount paymentMethod receiptNumber createdAt')
    .populate({
      path: 'volunteerApplication',
      select: 'assignedTask completedAt activityHours',
      populate: { path: 'opportunity', select: 'title' }
    });

  if (!certificate) return null;

  const status = normalizeCertificateStatus(certificate);
  if (status !== 'active') return null;

  // Backfill missing status/issuedAt for older rows.
  if (!certificate.status) {
    certificate.status = 'active';
    certificate.issuedAt = certificate.issuedAt || certificate.createdAt || new Date();
    await certificate.save();
  }

  return certificate;
};

// List all certificates for current user
router.get('/my', auth(['user']), async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate('ngo', 'name')
      .populate('campaign', 'title')
      .populate('donation', 'amount paymentMethod receiptNumber createdAt')
      .populate({
        path: 'volunteerApplication',
        select: 'assignedTask completedAt activityHours',
        populate: { path: 'opportunity', select: 'title' }
      })
      .sort({ issuedAt: -1 });
    const active = (certificates || []).filter((certificate) => normalizeCertificateStatus(certificate) === 'active');
    res.json(active);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a certificate (with printable HTML)
router.get('/:id', auth(['user']), async (req, res) => {
  try {
    const certificate = await getCertificateForUser(req.params.id, req.user.id);
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });

    res.json({
      certificate,
      html: renderCertificateHtml(certificate)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Download certificate as HTML file
router.get('/:id/download', auth(['user']), async (req, res) => {
  try {
    const certificate = await getCertificateForUser(req.params.id, req.user.id);
    if (!certificate) return res.status(404).json({ message: 'Certificate not found' });

    certificate.deliveredAt = new Date();
    await certificate.save();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${toCertificateSlug(certificate)}"`);
    res.send(renderCertificateHtml(certificate));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
