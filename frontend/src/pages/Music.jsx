// src/pages/Music.jsx
import { useState, useEffect } from 'react'
import { SONGS } from '../data/songs'

// ======= CONFIG: your real links
const SOCIAL_LINKS = {
  youtube: 'https://youtube.com/@rickypasswordrwa?si=hJBfh9Ed7_JnlZhx',
  instagram: 'https://www.instagram.com/rickypassword/',
}

// ======= Safe localStorage helpers
const ls = {
  get(k) { try { return window.localStorage.getItem(k) } catch { return null } },
  set(k, v) { try { window.localStorage.setItem(k, v) } catch {} },
}

// ======= URL helpers
/**
 * Resolve media URLs:
 *  - absolute (https://...) -> returned as-is
 *  - others -> ensure root-relative (prefix "/")
 */
const mediaUrl = (u = '') => {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  return encodeURI(u.startsWith('/') ? u : `/${u}`)
}

const toFileName = (t = 'track') => `${t.replace(/[^\w\-]+/g, '_')}.mp3`

// ========= Subscribe Gate Modal =========
function GateModal({ open, onClose, onUnlocked }) {
  const [yt, setYt] = useState(false)
  const [ig, setIg] = useState(false)

  useEffect(() => {
    if (open) {
      setYt(ls.get('rp_sub_yt') === '1')
      setIg(ls.get('rp_sub_ig') === '1')
    }
  }, [open])

  const toggleYt = (v) => { setYt(v); ls.set('rp_sub_yt', v ? '1' : '0') }
  const toggleIg = (v) => { setIg(v); ls.set('rp_sub_ig', v ? '1' : '0') }

  const canContinue = yt && ig
  if (!open) return null

  return (
    <div className="player-modal">
      <div className="player-modal-backdrop" onClick={onClose} />
      <div className="player-modal-card">
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Subscribe to unlock</h3>
        <p style={{ margin: '8px 0 14px', opacity: .85 }}>
          Please subscribe/follow on both platforms to listen or download.
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a className="btn" href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer">Open YouTube</a>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={yt} onChange={e => toggleYt(e.target.checked)} />
              I subscribed on YouTube
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a className="btn" href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">Open Instagram</a>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={ig} onChange={e => toggleIg(e.target.checked)} />
              I followed on Instagram
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={onClose}>Close</button>
          <button
            className="btn"
            disabled={!canContinue}
            onClick={() => { if (canContinue) { ls.set('rp_unlock_v1', '1'); onUnlocked() } }}
            style={{ opacity: canContinue ? 1 : .5 }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// ========= Audio Player Modal =========
function PlayerModal({ open, onClose, title, src }) {
  if (!open) return null
  return (
    <div className="player-modal">
      <div className="player-modal-backdrop" onClick={onClose} />
      <div className="player-modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <strong>{title || 'Preview'}</strong>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        {src ? (
          <audio controls autoPlay style={{ width: '100%' }}>
            <source src={mediaUrl(src)} />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div style={{ opacity: .8 }}>No preview configured yet.</div>
        )}
      </div>
    </div>
  )
}

// ========= Page =========
export default function Music() {
  const [tracks, setTracks] = useState([])
  const [gateOpen, setGateOpen] = useState(false)
  const [pending, setPending] = useState(null) // { type: 'listen'|'download', track }
  const [player, setPlayer] = useState({ open: false, title: '', src: '' })

  // On mount, load from local songs.js and respect prior unlock
  useEffect(() => {
    // auto-unlock if previously done
    const hadUnlock = ls.get('rp_unlock_v1') === '1'
    const alreadySubbed = ls.get('rp_sub_yt') === '1' && ls.get('rp_sub_ig') === '1'
    if (hadUnlock || alreadySubbed) {
      // no-op here; gating checks read directly from ls
    }

    // normalize SONGS -> tracks expected by UI
    const norm = (SONGS || []).map((x) => ({
      sku: x.sku ?? x.id ?? x.title,
      title: x.title ?? '',
      cover_url: x.cover_url ?? x.cover ?? '/cover.jpg',
      released_at: x.released_at ?? x.release_date ?? null,
      media_path: x.media_path ?? x.audio ?? '',
      preview_url: x.preview_url ?? x.audio ?? x.media_path ?? '',
      hidden: x.hidden === true || x.is_published === false,
    }))

    norm.sort((a, b) => new Date(b.released_at || 0) - new Date(a.released_at || 0))
    setTracks(norm.filter(t => !t.hidden))
  }, [])

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleString(undefined, { month: 'short', year: 'numeric' }) : ''

  const doListen = (t) => {
    setPlayer({ open: true, title: t.title, src: t.preview_url || t.media_path || '' })
  }
  const doDownload = (t) => {
    const url = t.media_path || t.preview_url
    if (!url) return alert('No file configured yet.')
    const a = document.createElement('a')
    a.href = mediaUrl(url)
    a.setAttribute('download', toFileName(t.title))
    document.body.appendChild(a); a.click(); a.remove()
  }

  const isUnlocked = () =>
    ls.get('rp_unlock_v1') === '1' || (ls.get('rp_sub_yt') === '1' && ls.get('rp_sub_ig') === '1')

  const requireUnlock = (intent) => {
    if (isUnlocked()) {
      if (intent?.type === 'listen') doListen(intent.track)
      else if (intent?.type === 'download') doDownload(intent.track)
      return
    }
    setPending(intent)
    setGateOpen(true)
  }

  const handleUnlocked = () => {
    setGateOpen(false)
    if (pending) {
      const p = pending
      setPending(null)
      if (p.type === 'listen') doListen(p.track)
      if (p.type === 'download') doDownload(p.track)
    }
  }

  return (
    <main className="music-page">
      <header className="page-head">
        <div className="container">
          <h1 className="page-title">Music</h1>
        </div>
      </header>

      <section>
        <div className="container">
          <div className="music-grid">
            {tracks.map((t, i) => (
              <figure className="release-card" key={t.sku || i}>
                <div className="release-media" style={{ position: 'relative' }}>
                  <img
                    src={mediaUrl(t.cover_url || '/cover.jpg')}
                    alt={`${t.title} cover art`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="release-overlay" />
                  <div className="release-actions" style={{ position: 'absolute', display: 'flex' }}>
                    <button
                      className="btn btn-solid"
                      onClick={() => requireUnlock({ type: 'listen', track: t })}
                    >
                      Listen
                    </button>
                    <button
                      className="btn"
                      onClick={() => requireUnlock({ type: 'download', track: t })}
                    >
                      Download
                    </button>
                  </div>
                </div>
                <figcaption className="release-caption">
                  {t.title} {fmtDate(t.released_at) ? `• ${fmtDate(t.released_at)}` : ''}
                </figcaption>
              </figure>
            ))}
            {tracks.length === 0 && <div style={{ opacity: .7 }}>No music yet.</div>}
          </div>
        </div>
      </section>

      {/* Modals */}
      <PlayerModal
        open={player.open}
        onClose={() => setPlayer(p => ({ ...p, open: false }))}
        title={player.title}
        src={player.src}
      />
      <GateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onUnlocked={handleUnlocked}
      />
    </main>
  )
}
