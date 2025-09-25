// src/components/Header.jsx
import { Link, NavLink } from 'react-router-dom'

const NavItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      'nav-link' + (isActive ? ' nav-active' : '')
    }
  >
    {label}
  </NavLink>
)

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          Rickypassword<span className="brand-accent">.</span>
        </Link>

        <nav className="nav">
          <NavItem to="/" label="HOME" />
          <NavItem to="/music" label="MUSIC" />
          <NavItem to="/shows" label="SHOWS" />
          <NavItem to="/news" label="NEWS" />
          <NavItem to="/gallery" label="GALLERY" />
          <NavItem to="/bio" label="BIO" />
          <NavItem to="/contact" label="CONTACT" />
        </nav>

        <div className="nav-right">
          {/* YouTube */}
          <a
            className="social"
            aria-label="YouTube"
            href="https://youtube.com/@rickypasswordrwa?si=hJBfh9Ed7_JnlZhx"
            target="_blank"
            rel="noopener noreferrer"
            title="Subscribe on YouTube"
          >
            {/* YouTube icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm-10 9V9l6 3-6 3Z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            className="social"
            aria-label="Instagram"
            href="https://www.instagram.com/rickypassword/"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow on Instagram"
          >
            {/* Instagram icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6.5-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}
