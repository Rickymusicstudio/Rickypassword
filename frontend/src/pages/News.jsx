// src/pages/News.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NEWS } from '../data/news'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric'
  })

export default function News() {
  // newest → oldest
  const posts = useMemo(
    () => [...NEWS].sort((a, b) => new Date(b.date) - new Date(a.date)),
    []
  )

  // --- Slider state ---
  const [idx, setIdx] = useState(0)
  const max = posts.length

  const next = () => setIdx(i => (i + 1) % max)
  const prev = () => setIdx(i => (i - 1 + max) % max)

  // Optional autoplay (7s)
  useEffect(() => {
    if (max <= 1) return
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [max])

  const current = posts[idx]
  const rest = posts.filter((_, i) => i !== idx)

  // Choose an image for the current slide
  const heroImg =
    (current?.cover_url && current.cover_url.length > 0
      ? current.cover_url
      : (current?.images?.[0] || '')) || ''

  return (
    <main className="news-page">
      {/* Page header aligned to gutters */}
      <header className="page-head">
        <div className="container">
          <h1 className="page-title">News</h1>
        </div>
      </header>

      {/* ===== Slider Hero (image left, content right) ===== */}
      {current && (
        <section>
          <div className="container">
            <div className="news-hero-slider">
              <article className="news-slide">
                <div
                  className="news-slide-img"
                  style={heroImg ? { backgroundImage: `url(${heroImg})` } : {}}
                  aria-hidden="true"
                />
                <div className="news-slide-content">
                  <div className="news-slide-date">{fmtDate(current.date)}</div>
                  <h2 className="news-slide-title">
                    <Link className="link-plain" to={`/news/${current.slug}`}>
                      {current.title}
                    </Link>
                  </h2>
                  {current.excerpt ? (
                    <p className="news-slide-excerpt">{current.excerpt}</p>
                  ) : null}
                </div>
              </article>

              {/* arrows */}
              {max > 1 && (
                <div className="slider-arrows">
                  <button className="icon-btn" aria-label="Previous" onClick={prev}>‹</button>
                  <button className="icon-btn" aria-label="Next" onClick={next}>›</button>
                </div>
              )}

              {/* dots */}
              {max > 1 && (
                <div className="slider-dots">
                  {posts.map((_, i) => (
                    <button
                      key={i}
                      className={`slider-dot ${i === idx ? 'active' : ''}`}
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => setIdx(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== The rest (cards) ===== */}
      <section>
        <div className="container">
          <div className="shop-grid" style={{ marginTop: 20 }}>
            {rest.map((p) => (
              <div key={p.slug} className="card">
                <div style={{ fontWeight: 800 }}>
                  <Link className="link-plain" to={`/news/${p.slug}`}>
                    {p.title}
                  </Link>
                </div>
                <div style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>{fmtDate(p.date)}</div>
                {p.excerpt ? <p style={{ marginTop: 8, opacity: .85 }}>{p.excerpt}</p> : null}
              </div>
            ))}
          </div>

          {/* Follow / Subscribe band */}
          <div className="cta-band">
            <div>
              <div className="cta-title">Never miss an update</div>
              <div className="cta-sub">Follow Rickypassword for new music, shows and studio updates.</div>
            </div>
            <div className="cta-actions">
              <a
                className="btn btn-solid"
                href="https://youtube.com/@rickypasswordrwa?si=hJBfh9Ed7_JnlZhx"
                target="_blank"
                rel="noreferrer"
              >
                Subscribe on YouTube
              </a>
              <a
                className="btn"
                href="https://www.instagram.com/rickypassword/"
                target="_blank"
                rel="noreferrer"
              >
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
