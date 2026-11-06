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
export const ShareIcon = (p) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
  </svg>
)
export const LinkIcon = (p) => (
  <svg {...base} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </svg>
)
export const WhatsAppIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6A12 12 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.5zM12 22a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.6.9 1-3.5-.3-.4A9.9 9.9 0 1 1 22 12a10 10 0 0 1-10 10zm5.4-7.5c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.4-1.7-1.6-1.9-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.4-.3.3-1 .9-1 2.3s1 2.7 1.1 2.8c.1.2 2 3 4.8 4.2 2.4.9 2.9.7 3.4.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
  </svg>
)
export const FacebookIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
  </svg>
)
export const XIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M18.2 2h3.5l-7.6 8.7L23 22h-7l-5.5-7.2L4.2 22H.7l8.1-9.3L.3 2h7.1l5 6.6L18.2 2zm-1.2 18h1.9L6.4 3.9H4.3L17 20z" />
  </svg>
)
