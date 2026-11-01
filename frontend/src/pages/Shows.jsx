// src/pages/Shows.jsx
import { Link } from 'react-router-dom'
import { shows as rawShows } from '../data/shows'
import { SOCIAL_LINKS, fmtDate } from '../lib/site'
import { InstagramIcon, YouTubeIcon } from '../components/Icons.jsx'

// Add dates in src/data/shows.js: { date: '2026-12-05', venue: 'BK Arena', city: 'Kigali, RW', tickets: 'https://…' }
export default function Shows() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Upcoming only, sorted soonest → latest
  const shows = rawShows
    .filter((s) => s?.date && new Date(s.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <div className="shows-page">
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Live</p>
          <h1 className="page-title">Shows</h1>
        </div>
      </header>

      <section className="container">
        {shows.length === 0 ? (
          <div className="empty-state">
            <div>
              <h2>No upcoming shows announced</h2>
              <p>
                We're planning the next dates. Follow for updates and be the first to know when new shows drop.
                For bookings and press, <Link to="/contact" className="link-plain" style={{ color: 'var(--accent)' }}>get in touch</Link>.
              </p>
            </div>
            <div className="cta-actions">
              <Link className="btn btn-primary" to="/contact">Book Ricky Password</Link>
              <a className="btn btn-ghost" href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
                <InstagramIcon width={18} height={18} /> Instagram
              </a>
              <a className="btn btn-ghost" href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer">
                <YouTubeIcon width={18} height={18} /> YouTube
              </a>
            </div>
          </div>
        ) : (
          <div className="show-list">
            {shows.map((s, i) => {
              const link = s.tickets || s.link
              return (
                <div key={`${s.date}-${s.venue}-${i}`} className="show-row">
                  <div className="show-date">{fmtDate(s.date, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  <div>
                    <div className="show-venue">{s.venue}</div>
                    <div className="show-city">{s.city}</div>
                  </div>
                  {link
                    ? <a className="btn btn-primary btn-sm" href={link} target="_blank" rel="noreferrer">Tickets</a>
                    : <span className="muted">Details soon</span>}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
