// api/contact.js
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { Resend } from 'resend';

const router = Router();

// rate limit (5 per minute)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 5 });

// validators
const validators = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').trim().isLength({ min: 3 }).withMessage('Message required'),
];

// POST /api/contact
router.post('/contact', limiter, validators, async (req, res) => {
  // honeypot support (optional)
  if (req.body.website) return res.status(200).json({ ok: true });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { name, email, message } = req.body;

  // instantiate here so it only runs if the route is hit
  const resend = new Resend(process.env.RESEND_API_KEY);
  const TO = process.env.CONTACT_TO;
  const FROM = process.env.CONTACT_FROM || 'onboarding@resend.dev';

  try {
    // send two emails (to you + confirmation to sender)
    await resend.emails.send({
      from: FROM,
      to: TO,
      subject: `New contact form: ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Thanks for contacting Ricky Password',
      text: `Hi ${name},\n\nThanks for your message — I’ll get back to you soon.\n\n— Ricky`,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err?.message || err);
    res.status(500).json({ error: 'Email service error' });
  }
});

export default router;
