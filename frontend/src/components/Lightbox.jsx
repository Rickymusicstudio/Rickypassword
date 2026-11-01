// src/components/Lightbox.jsx — full-screen image viewer (Esc / ← / →, click backdrop to close)
import { useEffect } from 'react'
import { mediaUrl } from '../data/tracks'
import { ArrowIcon, CloseIcon } from './Icons.jsx'

export default function Lightbox({ images, index, setIndex, onClose }) {
  const count = images?.length || 0

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count)
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [count, onClose, setIndex])

  if (!count) return null
  const step = (d) => (e) => { e.stopPropagation(); setIndex((i) => (i + d + count) % count) }

  return (
    <div className="lb" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image viewer">
      <img className="lb-img" src={mediaUrl(images[index])} alt="" onClick={(e) => e.stopPropagation()} />
      <button className="lb-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      {count > 1 && (
        <>
          <button className="lb-nav prev" onClick={step(-1)} aria-label="Previous image">
            <ArrowIcon style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button className="lb-nav next" onClick={step(1)} aria-label="Next image"><ArrowIcon /></button>
          <div className="lb-count">{index + 1} / {count}</div>
        </>
      )}
    </div>
  )
}
