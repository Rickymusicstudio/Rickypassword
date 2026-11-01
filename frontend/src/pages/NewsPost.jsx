// src/pages/NewsPost.jsx
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useContent } from '../data/ContentContext.jsx'
import { adminApi } from '../lib/adminApi'
import { fmtDate } from '../lib/site'
import Img from '../components/Img.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { ArrowIcon } from '../components/Icons.jsx'

const SITE_ORIGIN =
  (typeof window !== 'undefined' && window.location.origin) ||
  import.meta?.env?.VITE_SITE_URL ||
  'https://rickypassword.com'

const LONG_DATE = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
const newsImage = (p) => p.cover_url || p.images_share?.[0] || p.images?.[0] || ''

function ShareBar({ url, title }) {
  const [copied, setCopied] = useState(false)
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`

  const share = async () => {
    try {
      if (navigator.share) return await navigator.share({ title, url })
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* share sheet dismissed */ }
  }

  return (
    <div className="sharebar" aria-label="Share">
      <button className="btn btn-ghost btn-sm" onClick={share}>{copied ? 'Link copied' : 'Share'}</button>
      <a className="btn btn-ghost btn-sm" href={waHref} target="_blank" rel="noreferrer">WhatsApp</a>
    </div>
  )
}

export default function NewsPost() {
  const { slug } = useParams()
  const location = useLocation()
  // Support both /share/news/:slug and the short /n/:slug
  const isShare = location.pathname.startsWith('/share/news/') || location.pathname.startsWith('/n/')

  const sorted = useContent().news
  const post = sorted.find((n) => n.slug === slug)
  const more = sorted.filter((n) => n.slug !== slug).slice(0, 3)

  const [lbIndex, setLbIndex] = useState(-1)
  const closeLightbox = useCallback(() => setLbIndex(-1), [])
  const setIndex = useCallback((fn) => setLbIndex((i) => (typeof fn === 'function' ? fn(i) : fn)), [])

  // Track a view once per day per slug to avoid double-count on refreshes
  useEffect(() => {
    if (!slug) return
    try {
      const key = `rp:view:${slug}:${new Date().toISOString().slice(0, 10)}`
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        adminApi.trackView(slug).catch(() => {})
      }
    } catch {
      adminApi.trackView(slug).catch(() => {})
    }
  }, [slug])

  if (!post) return <Navigate to="/news" replace />

  const paragraphs = post.content ? post.content.split(/\n{2,}/g) : []
  const gallery = post.images_share?.length ? post.images_share : post.images || []
  const cover = newsImage(post)

  return (
    <div className="container">
      <article className="article">
        <Link to="/news" className="link-arrow">
          <ArrowIcon width={18} height={18} style={{ transform: 'rotate(180deg)' }} /> All news
        </Link>
        <h1 className="article-title">{post.title}</h1>
        <div className="article-date">{fmtDate(post.date, LONG_DATE)}</div>

        {cover && (isShare || !gallery.includes(cover)) && <Img src={cover} alt="" className="article-cover" full />}

        <div className="article-body">
          {paragraphs.map((para, i) => <p key={i} dangerouslySetInnerHTML={{ __html: para }} />)}
        </div>

        {gallery.length > 0 && (
          <>
            <h2 className="article-h3">Photos</h2>
            <div className="article-gallery">
              {gallery.map((src, i) => (
                <button key={src} onClick={() => setLbIndex(i)} aria-label={`Open photo ${i + 1}`}>
                  <Img src={src} alt="" />
                </button>
              ))}
            </div>
          </>
        )}

        <ShareBar url={`${SITE_ORIGIN}/n/${post.slug}`} title={post.title} />
      </article>

      {more.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section-head"><h2 className="section-title">More news</h2></div>
          <div className="news-grid">
            {more.map((p) => (
              <Link key={p.slug} to={`/news/${p.slug}`} className="news-card">
                <div className="news-card-img">{newsImage(p) && <Img src={newsImage(p)} alt="" />}</div>
                <div className="news-card-body">
                  <time className="eyebrow">{fmtDate(p.date)}</time>
                  <h3>{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {lbIndex >= 0 && <Lightbox images={gallery} index={lbIndex} setIndex={setIndex} onClose={closeLightbox} />}
    </div>
  )
}
