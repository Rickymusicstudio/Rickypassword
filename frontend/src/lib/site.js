// src/lib/site.js — shared site constants
export const SOCIAL_LINKS = {
  youtube: 'https://youtube.com/@rickypasswordrwa',
  instagram: 'https://www.instagram.com/rickypassword/',
}

export const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/music', label: 'Music' },
  { to: '/shows', label: 'Shows' },
  { to: '/news', label: 'News' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/bio', label: 'Bio' },
  { to: '/contact', label: 'Contact' },
]

export const fmtDate = (d, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!d) return ''
  const date = new Date(d)
  return Number.isNaN(date.getTime()) ? String(d) : date.toLocaleDateString(undefined, opts)
}
