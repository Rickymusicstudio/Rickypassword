// src/pages/NewsPost.jsx
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NEWS } from '../data/news'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'
  })

/** Article body block */
function Article({ post, showTitle = true }) {
  if (!post) return null
  const paragraphs = post.content ? post.content.split(/\n{2,}/g) : []
  const hasGallery = Array.isArray(post.images) && post.images.length > 0

  return (
    <article style={{ marginBottom: 36 }}>
      {/* Optional inline title (used for “more posts” section) */}
      {showTitle && (
        <>
          <h2 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 22 }}>{post.title}</h2>
          <div style={{ opacity: .7, marginBottom: 18 }}>{fmtDate(post.date)}</div>
        </>
      )}

      {post.cover_url ? (
        <img
          src={post.cover_url}
          alt=""
          style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 14, marginBottom: 18 }}
          loading="lazy"
          decoding="async"
        />
      ) : null}

      <div style={{ lineHeight: 1.8, fontSize: 16, marginBottom: hasGallery ? 24 : 0 }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{ margin: '0 0 14px' }} dangerouslySetInnerHTML={{ __html: para }} />
        ))}
      </div>

      {hasGallery && (
        <>
          <h3 style={{ margin: '0 0 12px', fontWeight: 800, fontSize: 18 }}>Gallery</h3>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            }}
          >
            {post.images.map((src, idx) => (
              <figure key={idx} style={{ margin: 0 }}>
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    borderRadius: 16,
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

  // All posts newest → oldest
  const sorted = useMemo(
    () => [...NEWS].sort((a, b) => new Date(b.date) - new Date(a.date)),
    []
  )

  // Choose the requested article (fallback to newest)
  const firstIdx = Math.max(0, sorted.findIndex(n => n.slug === slug))
  const first = firstIdx === -1 ? sorted[0] : sorted[firstIdx]
  const rest = sorted.filter((_, i) => i !== (firstIdx === -1 ? 0 : firstIdx))

  return (
    <main className="news-post-page">
      {/* Page header with big, responsive title */}
      <header className="page-head">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Link className="btn" to="/news">← Back to News</Link>
          </div>
          {first && (
            <>
              <h1 className="page-title" style={{ marginTop: 10 }}>{first.title}</h1>
              <div style={{ opacity: .75, marginBottom: 8 }}>{fmtDate(first.date)}</div>
            </>
          )}
        </div>
      </header>

      {/* Main article body on white for readability */}
      <section className="section-white">
        <div className="container" style={{ padding: '24px 0 48px' }}>
          <Article post={first} showTitle={false} />
        </div>
      </section>

      {/* More posts (optional) */}
      {rest.length > 0 && (
        <section>
          <div className="container" style={{ padding: '32px 0' }}>
            <div style={{ fontWeight: 900, marginBottom: 12, fontSize: 18 }}>More news</div>
            {rest.map((p, i) => (
              <div key={p.slug}>
                {i > 0 && (
                  <div
                    style={{
                      height: 1,
                      background: 'rgba(255,255,255,.08)',
                      margin: '24px 0'
                    }}
                  />
                )}
                <Article post={p} showTitle />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
