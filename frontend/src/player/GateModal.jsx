// src/player/GateModal.jsx — "subscribe on YouTube + follow on Instagram to unlock"
import { useEffect, useState } from 'react'
import { SOCIAL_LINKS } from '../lib/site'
import { CloseIcon, InstagramIcon, YouTubeIcon } from '../components/Icons.jsx'

export default function GateModal({ open, onClose, onUnlocked, storage }) {
  const [yt, setYt] = useState(false)
  const [ig, setIg] = useState(false)

  useEffect(() => {
    if (!open) return
    setYt(storage.get('rp_sub_yt') === '1')
    setIg(storage.get('rp_sub_ig') === '1')
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, storage, onClose])

  if (!open) return null
  const can = yt && ig

  const step = (checked, setChecked, key, href, Icon, action, label) => (
    <div className={`gate-step ${checked ? 'is-done' : ''}`}>
      <a className="gate-link" href={href} target="_blank" rel="noreferrer">
        <Icon width={22} height={22} />
        <span>{action}</span>
      </a>
      <label className="check">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => { setChecked(e.target.checked); storage.set(key, e.target.checked ? '1' : '0') }}
        />
        <span>{label}</span>
      </label>
    </div>
  )

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card">
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        <p className="eyebrow">Unlock the music</p>
        <h2 id="gate-title" className="modal-title">Subscribe to listen &amp; download</h2>
        <p className="muted">Follow Ricky Password on both platforms to stream and download every track. It's free.</p>

        <div className="gate-steps">
          {step(yt, setYt, 'rp_sub_yt', SOCIAL_LINKS.youtube, YouTubeIcon, 'Open YouTube', 'I subscribed on YouTube')}
          {step(ig, setIg, 'rp_sub_ig', SOCIAL_LINKS.instagram, InstagramIcon, 'Open Instagram', 'I followed on Instagram')}
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Not now</button>
          <button className="btn btn-primary" disabled={!can} onClick={() => can && onUnlocked()}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
