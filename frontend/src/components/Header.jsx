// src/components/Header.jsx
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NavItem = ({ to, label, onClick }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 'nav-link' + (isActive ? ' nav-active' : '')}
    onClick={onClick}
  >
    {label}
  </NavLink>
)

export default function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">Rickypassword<span className="brand-accent">.</span></Link>

        {/* Desktop nav (already centered by your CSS) */}
        <nav className="nav">
          <NavItem to="/" label="HOME" />
          <NavItem to="/music" label="MUSIC" />
          <NavItem to="/shows" label="SHOWS" />
          <NavItem to="/news" label="NEWS" />
          <NavItem to="/gallery" label="GALLERY" />
          <NavItem to="/bio" label="BIO" />
          <NavItem to="/contact" label="CONTACT" />
        </nav>

        {/* Right icons (hidden on small via your CSS) */}
        <div className="nav-right">
          <a
            href="https://youtube.com/@rickypasswordrwa?si=hJBfh9Ed7_JnlZhx"
            target="_blank" rel="noreferrer" className="social" aria-label="YouTube"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3.3 3.3 0 0 0-2.3-2.3C19.3 3.4 12 3.4 12 3.4s-7.3 0-9.2.5A3.3 3.3 0 0 0 .5 6.2 34.9 34.9 0 0 0 0 12a34.9 34.9 0 0 0 .5 5.8 3.3 3.3 0 0 0 2.3 2.3c1.9.5 9.2.5 9.2.5s7.3 0 9.2-.5a3.3 3.3 0 0 0 2.3-2.3c.4-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.7 15.3V8.7l6.2 3.3-6.2 3.3z"/>
            </svg>
          </a>
          <a
            href="https://www.instagram.com/rickypassword/"
            target="_blank" rel="noreferrer" className="social" aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2Zm0 7.8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm6.1-9.6a1.2 1.2 0 1 0 1.2 1.2 1.2 1.2 0 0 0-1.2-1.2Z"/>
            </svg>
          </a>
        </div>

        {/* Hamburger (hidden on ≥860px by CSS below) */}
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/>
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={'nav-drawer ' + (open ? 'open' : '')} aria-hidden={!open}>
        <div className="nav-drawer-backdrop" onClick={close} />
        <aside className="nav-drawer-panel" role="dialog" aria-modal="true" aria-label="Navigation">
          <NavItem to="/" label="HOME" onClick={close} />
          <NavItem to="/music" label="MUSIC" onClick={close} />
          <NavItem to="/shows" label="SHOWS" onClick={close} />
          <NavItem to="/news" label="NEWS" onClick={close} />
          <NavItem to="/gallery" label="GALLERY" onClick={close} />
          <NavItem to="/bio" label="BIO" onClick={close} />
          <NavItem to="/contact" label="CONTACT" onClick={close} />
          <div style={{ height: 8 }} />
          <a className="btn" href="https://youtube.com/@rickypasswordrwa?si=hJBfh9Ed7_JnlZhx" target="_blank" rel="noreferrer">YouTube</a>
          <a className="btn" href="https://www.instagram.com/rickypassword/" target="_blank" rel="noreferrer">Instagram</a>
        </aside>
      </div>
    </header>
  )
}
