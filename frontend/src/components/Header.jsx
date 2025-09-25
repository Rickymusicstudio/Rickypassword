// src/components/Header.jsx
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

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
  const location = useLocation()

  const closeMenu = () => setOpen(false)

  useEffect(() => {
    if (open) document.body.classList.add('no-scroll')
    else document.body.classList.remove('no-scroll')
    return () => document.body.classList.remove('no-scroll')
  }, [open])

  useEffect(() => {
    closeMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 860) closeMenu()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header className="header">
      <div className="container header-inner header-rel">
        {/* Hamburger (LEFT) */}
        <button
          className={`hamburger ${open ? 'open' : ''}`}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(o => !o)}
        >
          <span className="ham-line" />
        </button>

        {/* Brand (CENTER on mobile, left on desktop) */}
        <Link to="/" className="brand" onClick={closeMenu}>
          Rickypassword<span className="brand-accent">.</span>
        </Link>

        {/* Desktop nav (center on ≥860px) */}
        <nav className="nav">
          <NavItem to="/" label="HOME" />
          <NavItem to="/music" label="MUSIC" />
          <NavItem to="/shows" label="SHOWS" />
          <NavItem to="/news" label="NEWS" />
          <NavItem to="/gallery" label="GALLERY" />
          <NavItem to="/bio" label="BIO" />
          <NavItem to="/contact" label="CONTACT" />
        </nav>

        {/* Socials (RIGHT) */}
        <div className="nav-right">
          <a
            href="https://youtube.com/@rickypasswordrwa"
            aria-label="YouTube"
            className="social"
            target="_blank"
            rel="noreferrer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.5 6.2a4 4 0 0 0-2.8-2.8C18.7 3 12 3 12 3s-6.7 0-8.7.4A4 4 0 0 0 .5 6.2C0 8.3 0 12 0 12s0 3.7.5 5.8a4 4 0 0 0 2.8 2.8C5.3 21 12 21 12 21s6.7 0 8.7-.4a4 4 0 0 0 2.8-2.8c.5-2.1.5-5.8.5-5.8s0-3.7-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
            </svg>
          </a>

          <a
            href="https://www.instagram.com/rickypassword/"
            aria-label="Instagram"
            className="social"
            target="_blank"
            rel="noreferrer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Mobile dropdown (slides DOWN from header) */}
      <div
        id="mobile-nav"
        className={`mobile-dropdown ${open ? 'open' : ''}`}
        role="navigation"
        aria-hidden={!open}
      >
        <div className="container mobile-dropdown-inner">
          <NavItem to="/" label="HOME" onClick={closeMenu} />
          <NavItem to="/music" label="MUSIC" onClick={closeMenu} />
          <NavItem to="/shows" label="SHOWS" onClick={closeMenu} />
          <NavItem to="/news" label="NEWS" onClick={closeMenu} />
          <NavItem to="/gallery" label="GALLERY" onClick={closeMenu} />
          <NavItem to="/bio" label="BIO" onClick={closeMenu} />
          <NavItem to="/contact" label="CONTACT" onClick={closeMenu} />
        </div>
      </div>
    </header>
  )
}
