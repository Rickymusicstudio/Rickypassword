// src/components/Icons.jsx — small inline SVG icon set
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true }

export const PlayIcon = (p) => (
  <svg {...base} {...p}><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.2-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" /></svg>
)
export const PauseIcon = (p) => (
  <svg {...base} {...p}><rect x="6" y="4.5" width="4" height="15" rx="1.2" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" /></svg>
)
export const NextIcon = (p) => (
  <svg {...base} {...p}><path d="M5 6.1v11.8a.9.9 0 0 0 1.4.75L15 12.75a.9.9 0 0 0 0-1.5L6.4 5.35A.9.9 0 0 0 5 6.1zM17 5.5h2v13h-2z" /></svg>
)
export const PrevIcon = (p) => (
  <svg {...base} {...p}><path d="M19 6.1v11.8a.9.9 0 0 1-1.4.75L9 12.75a.9.9 0 0 1 0-1.5l8.6-5.9A.9.9 0 0 1 19 6.1zM5 5.5h2v13H5z" /></svg>
)
export const DownloadIcon = (p) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
  </svg>
)
export const CloseIcon = (p) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const ArrowIcon = (p) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
)
export const YouTubeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M23.5 6.2a4 4 0 0 0-2.8-2.8C18.7 3 12 3 12 3s-6.7 0-8.7.4A4 4 0 0 0 .5 6.2C0 8.3 0 12 0 12s0 3.7.5 5.8a4 4 0 0 0 2.8 2.8C5.3 21 12 21 12 21s6.7 0 8.7-.4a4 4 0 0 0 2.8-2.8c.5-2.1.5-5.8.5-5.8s0-3.7-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
  </svg>
)
export const InstagramIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
  </svg>
)
