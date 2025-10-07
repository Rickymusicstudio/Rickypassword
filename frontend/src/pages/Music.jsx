// src/pages/Music.jsx
import { useState, useEffect } from 'react'
import * as songsModule from '../data/songs'

// pull songs no matter how it's exported
function getSongsArray(mod) {
  if (Array.isArray(mod.default)) return mod.default
  if (Array.isArray(mod.SONGS)) return mod.SONGS
  if (Array.isArray(mod.songs)) return mod.songs
  return []
}

/* ------------------------------ constants -------------------------------- */
const SOCIAL_LINKS = {
  youtube: 'https://youtube.com/@rickypasswordrwa?si=hJBfh9Ed7_JnlZhx',
  instagram: 'https://www.instagram.com/rickypassword/',
}

const ls = {
  get(k){ try{ return window.localStorage.getItem(k)}catch{ return null } },
  set(k,v){ try{ window.localStorage.setItem(k,v)}catch{} },
}

const isHttpUrl = (u='') => /^https?:\/\//i.test(u)
const mediaUrl = (u='') => {
  if (!u) return ''
  if (isHttpUrl(u)) return u
  return encodeURI(u.startsWith('/') ? u : `/${u}`)
}
const toFileName = (t='track') => `${t.replace(/[^\w\-]+/g,'_')}.mp3`

/* ------------------------------- modals ---------------------------------- */
function GateModal({ open, onClose, onUnlocked }) {
  const [yt, setYt] = useState(false)
  const [ig, setIg] = useState(false)
  useEffect(() => {
    if (open) {
      setYt(ls.get('rp_sub_yt') === '1')
      setIg(ls.get('rp_sub_ig') === '1')
    }
  }, [open])
  const can = yt && ig
  if (!open) return null
  return (
    <div className="player-modal">
      <div className="player-modal-backdrop" onClick={onClose} />
      <div className="player-modal-card">
        <h3 style={{ margin:0, fontSize:18, fontWeight:800 }}>Subscribe to unlock</h3>
        <p style={{ margin:'8px 0 14px', opacity:.85 }}>
          Please subscribe/follow on both platforms to listen or download.
        </p>
        <div style={{ display:'grid', gap:12 }}>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <a className="btn" href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer">Open YouTube</a>
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14 }}>
              <input type="checkbox" checked={yt} onChange={e=>setYt(e.target.checked)||ls.set('rp_sub_yt', e.target.checked?'1':'0')} />
              I subscribed on YouTube
            </label>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <a className="btn" href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">Open Instagram</a>
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14 }}>
              <input type="checkbox" checked={ig} onChange={e=>setIg(e.target.checked)||ls.set('rp_sub_ig', e.target.checked?'1':'0')} />
              I followed on Instagram
            </label>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <button className="btn" onClick={onClose}>Close</button>
          <button
            className="btn"
            disabled={!can}
            onClick={() => { if (can) { ls.set('rp_unlock_v1','1'); onUnlocked() } }}
            style={{ opacity: can ? 1 : .5 }}
          >Continue</button>
        </div>
      </div>
    </div>
  )
}

function PlayerModal({ open, onClose, title, src }) {
  if (!open) return null
  return (
    <div className="player-modal">
      <div className="player-modal-backdrop" onClick={onClose} />
      <div className="player-modal-card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <strong>{title || 'Preview'}</strong>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        {src ? (
          <audio controls autoPlay style={{ width:'100%' }}>
            <source src={mediaUrl(src)} />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div style={{ opacity:.8 }}>No preview configured yet.</div>
        )}
      </div>
    </div>
  )
}

/* --------------------------------- page ---------------------------------- */
export default function Music() {
  const [tracks, setTracks] = useState([])
  const [gateOpen, setGateOpen] = useState(false)
  const [pending, setPending] = useState(null)
  const [player, setPlayer] = useState({ open:false, title:'', src:'' })
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const RAW = getSongsArray(songsModule)

      const norm = (RAW || []).map((x) => {
        const youtubeUrl = x.youtube_url ?? x.youtube ?? ''
        const ytOnly = x.youtube_only === true || x.listen === 'youtube'
        return {
          sku: x.sku ?? x.id ?? x.title,
          title: x.title ?? '',
          cover_url: x.cover_url ?? x.cover ?? '/cover.jpg',
          released_at: x.released_at ?? x.release_date ?? null,
          media_path: x.media_path ?? x.audio ?? '',
          preview_url: x.preview_url ?? x.audio ?? x.media_path ?? '',
          youtube_url: youtubeUrl,
          ytOnly,
          hidden: x.hidden === true || x.is_published === false,
          can_download: x.can_download !== false && !ytOnly,
        }
      })

      norm.sort((a,b) => new Date(b.released_at || 0) - new Date(a.released_at || 0))
      setTracks(norm.filter(t => !t.hidden))
      setError(null)
    } catch (e) {
      console.error('[music] songs load error:', e)
      setError('Failed to load local songs data.')
    }
  }, [])

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleString(undefined, { month:'short', year:'numeric' }) : ''

  const openYouTube = (t) => {
    const url = t.youtube_url || SOCIAL_LINKS.youtube
    if (!url) return alert('No YouTube URL configured.')
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const doListen = (t) => {
    if (t.ytOnly) return openYouTube(t)
    setPlayer({ open:true, title:t.title, src:t.preview_url || t.media_path || '' })
  }

  const doDownload = (t) => {
    if (!t.can_download) return
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
    // Always allow YouTube-only tracks without the subscription gate
    if (intent?.track?.ytOnly) {
      if (intent.type === 'listen') doListen(intent.track)
      return
    }
    if (isUnlocked()) {
      if (intent?.type === 'listen') doListen(intent.track)
      else if (intent?.type === 'download') doDownload(intent.track)
      return
    }
    setPending(intent); setGateOpen(true)
  }

  const handleUnlocked = () => {
    setGateOpen(false)
    if (pending) {
      const p = pending; setPending(null)
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
          {error && <div style={{ color:'crimson', marginBottom:12 }}>{error}</div>}

          <div className="music-grid">
            {tracks.map((t, i) => (
              <figure className="release-card" key={t.sku || i}>
                <div className="release-media" style={{ position:'relative' }}>
                  <img
                    src={mediaUrl(t.cover_url || '/cover.jpg')}
                    alt={`${t.title} cover art`}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="release-overlay" />

                  <div className="release-actions" style={{ position:'absolute', display:'flex' }}>
                    {t.ytOnly ? (
                      <a
                        className="btn btn-solid"
                        href={t.youtube_url || SOCIAL_LINKS.youtube}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => { e.stopPropagation() }}
                      >
                        Watch on YouTube
                      </a>
                    ) : (
                      <>
                        <button
                          className="btn btn-solid"
                          onClick={() => requireUnlock({ type:'listen', track:t })}
                        >
                          Listen
                        </button>
                        {t.can_download ? (
                          <button className="btn" onClick={() => requireUnlock({ type:'download', track:t })}>
                            Download
                          </button>
                        ) : (
                          <button className="btn" disabled title="Download disabled for this track">
                            Download
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <figcaption className="release-caption">
                  {t.title} {fmtDate(t.released_at) ? `• ${fmtDate(t.released_at)}` : ''}
                  {t.ytOnly && <span style={{ marginLeft:8, fontSize:12, opacity:.8 }}>(YouTube only)</span>}
                </figcaption>
              </figure>
            ))}
            {tracks.length === 0 && !error && <div style={{ opacity:.7 }}>No music yet.</div>}
          </div>
        </div>
      </section>

      <PlayerModal
        open={player.open}
        onClose={() => setPlayer(p => ({ ...p, open:false }))}
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
