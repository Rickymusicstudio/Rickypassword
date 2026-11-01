// src/components/Header.jsx
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS, SOCIAL_LINKS } from '../lib/site'
import { InstagramIcon, YouTubeIcon } from './Icons.jsx'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // close menu on navigation
  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open)
    return () => document.body.classList.remove('no-scroll')
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The mobile menu is a sibling of <header>: the header's backdrop-filter would otherwise
  // become the containing block for the fixed-position menu.
  return (
    <>
      <header className={`header ${scrolled || open ? 'is-solid' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Ricky Password home">
            Ricky<span>Password</span>
          </Link>

          <nav className="nav" aria-label="Main">
            {NAV_ITEMS.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-link">
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-end">
            <a href={SOCIAL_LINKS.youtube} aria-label="YouTube" className="social" target="_blank" rel="noreferrer">
              <YouTubeIcon width={18} height={18} />
            </a>
            <a href={SOCIAL_LINKS.instagram} aria-label="Instagram" className="social" target="_blank" rel="noreferrer">
              <InstagramIcon width={18} height={18} />
            </a>
            <button
              className={`hamburger ${open ? 'open' : ''}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((o) => !o)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      <nav id="mobile-nav" className={`mobile-nav ${open ? 'open' : ''}`} aria-label="Mobile" inert={!open}>
        {NAV_ITEMS.map((n, i) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="mobile-link" style={{ '--i': i }}>
            {n.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
