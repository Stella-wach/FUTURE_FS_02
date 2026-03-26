const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

/**
 * POST /api/contact
 * Public endpoint — no auth required.
 * This is what you'd call from your business website's contact form.
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, message, source } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    // Basic email validation
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      company: company?.trim() || '',
      message: message?.trim() || '',
      source: source || 'website',
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! We\'ll be in touch shortly.',
      leadId: lead._id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
