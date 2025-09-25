// api/contact.js
import { Router } from 'express'
import { Resend } from 'resend'

const router = Router()
const resend = new Resend(process.env.RESEND_API_KEY)

router.post('/', async (req, res) => {
  try {
    const { name = 'Anonymous', email = '', message = '' } = req.body || {}

    const toList = (process.env.CONTACT_TO || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (!toList.length) return res.status(500).json({ error: 'CONTACT_TO missing' })
    if (!process.env.CONTACT_FROM) return res.status(500).json({ error: 'CONTACT_FROM missing' })

    const { data, error } = await resend.emails.send({
      from: `${process.env.CONTACT_FROM_NAME || 'Website'} <${process.env.CONTACT_FROM}>`,
      to: toList,
      subject: process.env.CONTACT_SUBJECT || `New message from ${name}`,
      text: `From: ${name}${email ? ` <${email}>` : ''}\n\n${message}`,
      ...(email ? { reply_to: email } : {}),
    })

    if (error) return res.status(502).json({ error: error.message || 'Email send failed' })
    return res.status(200).json({ ok: true, id: data?.id })
  } catch (e) {
    console.error('Contact route exception:', e)
    return res.status(500).json({ error: 'Server error' })
  }
})

export default router
