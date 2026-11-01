// src/pages/Contact.jsx
import { useState } from 'react'
import { SOCIAL_LINKS } from '../lib/site'
import { InstagramIcon, YouTubeIcon } from '../components/Icons.jsx'

export default function Contact() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [err, setErr] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setStatus('sending')

    const formEl = e.currentTarget // capture before await
    const form = new FormData(formEl)
    const payload = {
      name: (form.get('name') || '').trim(),
      email: (form.get('email') || '').trim(),
      message: (form.get('message') || '').trim(),
      website: form.get('website') || '', // honeypot
    }

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('idle')
      setErr('Please fill out all fields.')
      return
    }

    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      let data = {}
      try { data = await r.json() } catch { /* empty body */ }

      if (r.ok) {
        setStatus('sent')
        formEl.reset()
      } else {
        setStatus('error')
        setErr(data?.error || 'Could not send. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setErr(error?.message || 'Network error. Please try again.')
      console.error('Contact submit failed:', error)
    }
  }

  return (
    <div className="contact-page">
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Bookings · Press · Collabs</p>
          <h1 className="page-title">Contact</h1>
        </div>
      </header>

      <section className="container contact-grid">
        <div className="contact-aside">
          <h2>Let's work together</h2>
          <p className="muted">
            For bookings, interviews, features and collaborations, send a message and the team will get back to you.
          </p>
          <div className="cta-actions">
            <a className="btn btn-ghost btn-sm" href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
              <InstagramIcon width={16} height={16} /> Instagram
            </a>
            <a className="btn btn-ghost btn-sm" href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer">
              <YouTubeIcon width={16} height={16} /> YouTube
            </a>
          </div>
        </div>

        <form className="card form" onSubmit={onSubmit} noValidate={false}>
          {/* Honeypot (keep hidden) */}
          <input type="text" name="website" tabIndex="-1" autoComplete="off" hidden />

          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" className="input" name="name" placeholder="Your name" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" className="input" name="message" rows={6} placeholder="Tell us about your event or idea…" required />
          </div>

          <button className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>

          <div className="form-status" aria-live="polite">
            {status === 'sent' && <span className="ok">Thanks, your message was sent!</span>}
            {err && <span className="err">{err}</span>}
          </div>
        </form>
      </section>
    </div>
  )
}
