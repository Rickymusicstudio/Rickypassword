// src/pages/NewsPost.jsx
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NEWS } from '../data/news'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })

const SITE_ORIGIN =
  (typeof window !== 'undefined' && window.location.origin) ||
  (import.meta?.env?.VITE_SITE_URL) ||
  'https://rickypassword.com'

/** Minimal share strip: label + small icon buttons (Copy, WhatsApp) */
function ShareBar({ url, title }) {
  const enc = encodeURIComponent
  const waHref = `https://wa.me/?text=${enc(`${title} — ${url}`)}`

  const wrap = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,   // sits just under the text
    marginBottom: 2,
  }
  const label = { color: 'rgba(0,0,0,.6)', fontWeight: 600, fontSize: 14, marginRight: 2 }
  const iconBtn = {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: '1px solid rgba(0,0,0,.12)',
    background: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }
  const iconSvg = { width: 18, height: 18, display: 'block' }

  const toast = (msg) => {
    const t = document.createElement('div')
    t.textContent = msg
    Object.assign(t.style, {
      position: 'fixed', bottom: '18px', left: '50%', transform: 'translateX(-50%)',
      background: '#111', color: '#fff', padding: '6px 10px', borderRadius: 8,
      fontSize: 12, zIndex: 9999, boxShadow: '0 6px 18px rgba(0,0,0,.18)'
    })
    document.body.appendChild(t); setTimeout(() => t.remove(), 1100)
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast('Link copied') } catch {}
  }

  return (
    <div style={wrap} aria-label="Share">
      <span style={label}>Share</span>

      {/* Copy link */}
      <button aria-label="Copy link" onClick={copy} style={iconBtn}>
        <svg viewBox="0 0 24 24" style={iconSvg} aria-hidden="true">
          <path fill="currentColor"
            d="M10.6 13.4a1 1 0 0 0 1.4 1.4l4.24-4.24a3 3 0 1 0-4.24-4.24L9 8.26a1 1 0 1 0 1.41 1.41l3.06-3.06a1 1 0 1 1 1.41 1.41L10.6 13.4ZM13.4 10.6a1 1 0 0 0-1.4-1.4L7.76 13.4a3 3 0 1 0 4.24 4.24L15 14.74a1 1 0 0 0-1.41-1.41l-3.06 3.06a1 1 0 1 1-1.41-1.41L13.4 10.6Z"/>
        </svg>
      </button>

      {/* WhatsApp */}
      <a aria-label="Share on WhatsApp" href={waHref} target="_blank" rel="noreferrer" style={iconBtn}>
        <svg viewBox="0 0 24 24" style={{ ...iconSvg, color: '#25D366' }} aria-hidden="true">
          <path fill="currentColor"
            d="M20.52 3.48A11.9 11.9 0 0 0 12.06 0C5.44 0 .06 5.37.06 12c0 2.11.55 4.15 1.61 5.96L.01 24l6.2-1.62A11.86 11.86 0 0 0 12.06 24C18.69 24 24.06 18.63 24.06 12c0-3.18-1.24-6.16-3.54-8.52ZM12.06 22a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.57.93.95-3.49-.23-.36A9.93 9.93 0 1 1 22.06 12a9.95 9.95 0 0 1-10 10Zm5.3-7.48c-.29-.14-1.71-.84-1.98-.94-.27-.1-.47-.14-.67.14-.2.29-.77.94-.95 1.13-.17.19-.35.22-.64.08-.29-.14-1.23-.45-2.35-1.43-.86-.73-1.44-1.64-1.6-1.92-.17-.29-.02-.45.12-.59.12-.12.29-.32.43-.48.14-.16.19-.27.29-.45.1-.19.05-.35-.02-.48-.07-.14-.67-1.61-.91-2.21-.24-.58-.48-.5-.67-.51h-.57c-.19 0-.48.07-.73.35-.25.29-.96.94-.96 2.28 0 1.35.99 2.65 1.13 2.84.14.19 1.95 2.98 4.74 4.18.66.29 1.18.46 1.59.6.67.21 1.28.18 1.76.11.54-.08 1.71-.7 1.95-1.38.24-.67.24-1.25.17-1.38-.07-.13-.26-.2-.55-.34Z"/>
        </svg>
      </a>
    </div>
  )
}

/** Single full article block (share appears after text, before any gallery) */
function Article({ post, first = false }) {
  const paragraphs = post.content ? post.content.split(/\n{2,}/g) : []
  const hasGallery = Array.isArray(post.images) && post.images.length > 0

  // Share via OG-enabled URL that renders meta tags server-side
  const shareUrl = `${SITE_ORIGIN}/share/news/${post.slug}`

  return (
    <article style={{ marginBottom: 36 }}>
      {first ? (
        <h1 className="h2" style={{ margin: '8px 0 6px' }}>{post.title}</h1>
      ) : (
        <h2 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 22 }}>{post.title}</h2>
      )}
      {/* extra breathing room under title/date */}
      <div style={{ opacity: .7, marginBottom: 14 }}>{fmtDate(post.date)}</div>

      {/* cover image (kept before text) */}
      {post.cover_url ? (
        <img
          src={post.cover_url}
          alt=""
          style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 14, marginBottom: 16 }}
          loading="lazy"
        />
      ) : null}

      {/* article text */}
      <div style={{ lineHeight: 1.8, fontSize: 16, marginBottom: 8 }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{ margin: '0 0 12px' }} dangerouslySetInnerHTML={{ __html: para }} />
        ))}
      </div>

      {/* Share bar RIGHT AFTER TEXT (before gallery) */}
      <ShareBar url={shareUrl} title={post.title} />

      {/* optional gallery below share */}
      {hasGallery && (
        <>
          <h3 style={{ margin: '12px 0 10px', fontWeight: 800, fontSize: 18 }}>Gallery</h3>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              justifyContent: 'start'
            }}
          >
            {post.images.map((src, idx) => (
              <figure key={idx} style={{ margin: 0, width: '100%' }}>
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    borderRadius: 12,
                    display: 'block'
                  }}
                />
              </figure>
            ))}
          </div>
        </>
      )}
    </article>
  )
}

export default function NewsPost() {
  const { slug } = useParams()

  const sorted = useMemo(() => [...NEWS].sort((a, b) => new Date(b.date) - new Date(a.date)), [])
  const ordered = useMemo(() => {
    const idx = sorted.findIndex(n => n.slug === slug)
    if (idx === -1) return sorted
    return [sorted[idx], ...sorted.filter((_, i) => i !== idx)]
  }, [slug, sorted])

  return (
    <div className="section-white">
      <section className="container" style={{ padding: '64px 0' }}>
        <Link className="btn" to="/news" style={{ marginBottom: 16, display: 'inline-block' }}>
          ← Back to News
        </Link>

        {ordered.map((p, i) => (
          <div key={p.slug}>
            {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,.08)', margin: '24px 0' }} />}
            <Article post={p} first={i === 0} />
          </div>
        ))}
      </section>
    </div>
  )
}
