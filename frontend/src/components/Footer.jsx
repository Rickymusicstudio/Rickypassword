// src/components/Footer.jsx
import { Link } from 'react-router-dom'
import { NAV_ITEMS, SOCIAL_LINKS } from '../lib/site'
import { InstagramIcon, YouTubeIcon } from './Icons.jsx'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Link to="/" className="brand">Ricky<span>Password</span></Link>
          <p className="muted footer-tag">Rwandan artist · Kigali · Since 2011</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          {NAV_ITEMS.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
        </nav>

        <div className="footer-socials">
          <a className="btn btn-ghost btn-sm" href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer">
            <YouTubeIcon width={16} height={16} /> YouTube
          </a>
          <a className="btn btn-ghost btn-sm" href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
            <InstagramIcon width={16} height={16} /> Instagram
          </a>
        </div>
      </div>
      <div className="container footer-legal">© {new Date().getFullYear()} Ricky Password. All rights reserved.</div>
    </footer>
  )
}
