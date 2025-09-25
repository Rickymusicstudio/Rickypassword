import nodemailer from 'nodemailer'
import { Resend } from 'resend'

const useResend = !!process.env.RESEND_API_KEY

let transporter = null
if (!useResend) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const resend = useResend ? new Resend(process.env.RESEND_API_KEY) : null

function escapeHtml(s = '') {
  return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]))
}

export async function verifyTransporter() {
  if (useResend) return true
  try {
    await transporter.verify()
    return true
  } catch {
    return false
  }
}

export async function sendContactEmail({ name, email, message }) {
  const to = process.env.CONTACT_TO || process.env.SMTP_USER
  const from = process.env.CONTACT_FROM || `"Website" <${process.env.SMTP_USER}>`
  const subject = `New message from ${name}`
  const text = `From: ${name} <${email}>\n\n${message}`
  const html = `
    <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `

  if (useResend) {
    // Resend uses `reply_to`, not `replyTo`
    await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
      reply_to: email,
    })
  } else {
    await transporter.sendMail({ from, to, subject, text, html, replyTo: email })
  }
}
 
