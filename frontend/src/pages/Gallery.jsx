// src/pages/Gallery.jsx
import { useEffect, useMemo, useState } from 'react'
import { GALLERY } from '../data/gallery'

const resolveSrc = (item) =>
  item?.src ? item.src : item?.file ? `/gallery/${item.file}` : ''

export default function Gallery() {
  // newest first
  const items = useMemo(
    () =>
      [...GALLERY]
        .filter(Boolean)
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    []
  )

  // Lightbox state
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)

  const openAt = (i) => { setIdx(i); setOpen(true) }
  const close = () => setOpen(false)
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length)
  const next = () => setIdx((i) => (i + 1) % items.length)

  // Keyboard controls for lightbox
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, items.length])

  return (
    <main className="gallery-page">
      {/* Page header aligned to gutters */}
      <header className="page-head">
        <div className="container">
          <h1 className="page-title">Gallery</h1>
        </div>
      </header>

      {/* Content */}
      <section>
        <div className="container">
          {items.length === 0 ? (
            <div className="card" style={{ opacity: .85 }}>
              No photos yet. Add files to <code>/public/gallery</code> and entries to{' '}
              <code>src/data/gallery.js</code>.
            </div>
          ) : (
            <div className="gallery-grid">
              {items.map((it, i) => {
                const src = resolveSrc(it)
                if (!src) return null
                return (
                  <button
                    key={it.id || it.file || i}
                    className="gallery-card"
                    onClick={() => openAt(i)}
                    aria-label="Open image"
                  >
                    <img src={src} alt="" loading="lazy" decoding="async" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {open && (
        <div className="lb" onClick={close} role="dialog" aria-modal="true">
          <img
            className="lb-img"
            src={resolveSrc(items[idx])}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lb-close" onClick={close} aria-label="Close">×</button>
          {items.length > 1 && (
            <>
              <button
                className="lb-nav prev"
                onClick={(e) => { e.stopPropagation(); prev() }}
                aria-label="Previous"
              >‹</button>
              <button
                className="lb-nav next"
                onClick={(e) => { e.stopPropagation(); next() }}
                aria-label="Next"
              >›</button>
            </>
          )}
        </div>
      )}
    </main>
  )
}
