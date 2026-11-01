// src/player/PlayerContext.jsx — one site-wide <audio> so music keeps playing across pages.
// Listening/downloading still goes through the YouTube + Instagram subscribe gate.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { SOCIAL_LINKS } from '../lib/site'
import { mediaUrl, toFileName } from '../data/tracks'
import { useContent } from '../data/ContentContext.jsx'
import GateModal from './GateModal.jsx'

const PlayerContext = createContext(null)

const ls = {
  get(k) { try { return window.localStorage.getItem(k) } catch { return null } },
  set(k, v) { try { window.localStorage.setItem(k, v) } catch { /* storage blocked */ } },
}

const isUnlocked = () =>
  ls.get('rp_unlock_v1') === '1' || (ls.get('rp_sub_yt') === '1' && ls.get('rp_sub_ig') === '1')

const openYouTube = (t) =>
  window.open(t?.youtube_url || SOCIAL_LINKS.youtube, '_blank', 'noopener,noreferrer')

function downloadTrack(t) {
  const url = t.media_path || t.preview_url
  if (!t.can_download || !url) return
  const a = document.createElement('a')
  a.href = mediaUrl(url)
  a.setAttribute('download', toFileName(t.title))
  document.body.appendChild(a); a.click(); a.remove()
}

export function PlayerProvider({ children }) {
  const { tracks } = useContent()
  const audioRef = useRef(null)
  const [queue, setQueue] = useState(tracks)
  const [index, setIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState({ current: 0, duration: 0 })
  const [gate, setGate] = useState({ open: false, pending: null })

  const current = index >= 0 ? queue[index] : null

  const load = useCallback((list, i) => {
    const t = list[i]
    const audio = audioRef.current
    if (!t || !audio) return
    setQueue(list)
    setIndex(i)
    audio.src = mediaUrl(t.preview_url || t.media_path)
    audio.play().catch(() => setPlaying(false))
  }, [])

  const run = useCallback((intent) => {
    const { type, track, list } = intent
    if (type === 'download') return downloadTrack(track)
    const q = (list || tracks).filter((t) => !t.ytOnly)
    const i = q.findIndex((t) => t.sku === track.sku)
    load(q, Math.max(i, 0))
  }, [load, tracks])

  /** Play a track (optionally within a list). YouTube-only tracks skip the gate. */
  const play = useCallback((track, list) => {
    if (!track) return
    if (track.ytOnly) return openYouTube(track)
    if (current?.sku === track.sku) {
      const audio = audioRef.current
      if (audio.paused) audio.play().catch(() => {})
      else audio.pause()
      return
    }
    const intent = { type: 'listen', track, list }
    if (isUnlocked()) run(intent)
    else setGate({ open: true, pending: intent })
  }, [current, run])

  const download = useCallback((track) => {
    if (!track?.can_download) return
    const intent = { type: 'download', track }
    if (isUnlocked()) run(intent)
    else setGate({ open: true, pending: intent })
  }, [run])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [current])

  const next = useCallback(() => {
    if (queue.length) load(queue, (index + 1) % queue.length)
  }, [queue, index, load])

  const prev = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return }
    if (queue.length) load(queue, (index - 1 + queue.length) % queue.length)
  }, [queue, index, load])

  const seek = useCallback((seconds) => {
    const audio = audioRef.current
    if (audio && Number.isFinite(seconds)) audio.currentTime = seconds
  }, [])

  const close = useCallback(() => {
    const audio = audioRef.current
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load() }
    setIndex(-1)
    setTime({ current: 0, duration: 0 })
  }, [])

  // Lock-screen / headset controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !current) return
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: current.title,
      artist: 'Ricky Password',
      artwork: [{ src: new URL(mediaUrl(current.cover_url), window.location.origin).href }],
    })
    navigator.mediaSession.setActionHandler('play', toggle)
    navigator.mediaSession.setActionHandler('pause', toggle)
    navigator.mediaSession.setActionHandler('nexttrack', next)
    navigator.mediaSession.setActionHandler('previoustrack', prev)
  }, [current, toggle, next, prev])

  const closeGate = useCallback(() => setGate({ open: false, pending: null }), [])

  const onUnlocked = () => {
    ls.set('rp_unlock_v1', '1')
    const p = gate.pending
    closeGate()
    if (p) run(p)
  }

  const value = { current, playing, time, queue, play, download, toggle, next, prev, seek, close }

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={next}
        onTimeUpdate={(e) => setTime({ current: e.currentTarget.currentTime, duration: e.currentTarget.duration || 0 })}
        onLoadedMetadata={(e) => setTime({ current: 0, duration: e.currentTarget.duration || 0 })}
      />
      <GateModal
        open={gate.open}
        onClose={closeGate}
        onUnlocked={onUnlocked}
        storage={ls}
      />
    </PlayerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>')
  return ctx
}
