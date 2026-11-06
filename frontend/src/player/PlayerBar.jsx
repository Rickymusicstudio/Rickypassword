// src/player/PlayerBar.jsx — persistent bottom player
import { Link } from 'react-router-dom'
import { usePlayer } from './PlayerContext.jsx'
import { mediaUrl } from '../data/tracks'
import { CloseIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from '../components/Icons.jsx'

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function PlayerBar() {
  const { current, playing, time, toggle, next, prev, seek, close } = usePlayer()
  if (!current) return null

  const pct = time.duration ? (time.current / time.duration) * 100 : 0

  return (
    <div className="playerbar" role="region" aria-label="Music player">
      <div className="playerbar-progress" style={{ '--pct': `${pct}%` }}>
        <input
          type="range"
          min={0}
          max={time.duration || 0}
          step="0.1"
          value={time.current}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
        />
      </div>
      <div className="container playerbar-inner">
        <Link to={`/music/${current.slug}`} className="playerbar-track" title="Open song page">
          <img src={mediaUrl(current.cover_url)} alt="" className={playing ? 'spin' : ''} />
          <div className="playerbar-meta">
            <div className="playerbar-title">{current.title}</div>
            <div className="playerbar-sub">Ricky Password</div>
          </div>
        </Link>

        <div className="playerbar-controls">
          <button className="icon-btn" onClick={prev} aria-label="Previous track"><PrevIcon /></button>
          <button className="icon-btn icon-btn-lg" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="icon-btn" onClick={next} aria-label="Next track"><NextIcon /></button>
        </div>

        <div className="playerbar-end">
          <span className="playerbar-time">{fmt(time.current)} / {fmt(time.duration)}</span>
          <button className="icon-btn" onClick={close} aria-label="Close player"><CloseIcon width={18} height={18} /></button>
        </div>
      </div>
    </div>
  )
}
