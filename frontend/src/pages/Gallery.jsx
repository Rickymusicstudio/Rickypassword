// src/pages/Gallery.jsx
import { useCallback, useMemo, useState } from 'react'
import { useContent } from '../data/ContentContext.jsx'
import Img from '../components/Img.jsx'
import Lightbox from '../components/Lightbox.jsx'

export default function Gallery() {
  const items = useContent().gallery // newest first
  const sources = useMemo(() => items.map((it) => it.src), [items])

  const [idx, setIdx] = useState(-1)
  const close = useCallback(() => setIdx(-1), [])
  const setIndex = useCallback((fn) => setIdx((i) => (typeof fn === 'function' ? fn(i) : fn)), [])

  return (
    <div className="gallery-page">
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">On stage · In studio</p>
          <h1 className="page-title">Gallery</h1>
        </div>
      </header>

      <section className="container">
        {items.length === 0 ? (
          <p className="muted">No photos yet.</p>
        ) : (
          <div className="gallery-grid">
            {items.map((it, i) => (
              <button
                key={`${it.id || it.file}-${i}`}
                className="gallery-card"
                onClick={() => setIdx(i)}
                aria-label={`Open photo ${i + 1}`}
              >
                <Img src={sources[i]} alt={it.caption || ''} />
              </button>
            ))}
          </div>
        )}
      </section>

      {idx >= 0 && <Lightbox images={sources} index={idx} setIndex={setIndex} onClose={close} />}
    </div>
  )
}
