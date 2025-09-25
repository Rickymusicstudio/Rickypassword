import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { sendContactEmail, verifyTransporter } from './email.js'

const router = Router()

router.get('/health', async (req, res) => {
  const mail = await verifyTransporter()
  res.json({ ok: true, service: 'rickypassword-backend', mail, time: new Date().toISOString() })
})

router.post(
  '/contact',
  [
    body('name').trim().isLength({ min: 2, max: 80 }),
    body('email').isEmail().normalizeEmail(),
    body('message').trim().isLength({ min: 5, max: 5000 }),
    body('website').optional().isEmpty(), // honeypot
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ ok: false, error: 'Invalid input', details: errors.array() })
    }
    const { name, email, message } = req.body
    try {
      await sendContactEmail({ name, email, message })
      res.json({ ok: true })
    } catch (err) {
      console.error('Email send failed:', err)
      res.status(500).json({ ok: false, error: 'Mail send failed' })
    }
  }
)

export default router
 
