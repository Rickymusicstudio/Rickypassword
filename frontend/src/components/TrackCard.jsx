// src/components/TrackCard.jsx — cover-art card with play state, used on Home and Music
import { usePlayer } from '../player/PlayerContext.jsx'
import { releaseYear } from '../data/tracks'
import Img from './Img.jsx'
import { DownloadIcon, PauseIcon, PlayIcon, YouTubeIcon } from './Icons.jsx'

export default function TrackCard({ track, list, showDownload = false }) {
  const { current, playing, play, download } = usePlayer()
  const active = current?.sku === track.sku
  const isPlaying = active && playing

  return (
    <article className={`track-card ${active ? 'is-active' : ''}`}>
      <div className="track-art">
        <Img src={track.cover_url} alt={`${track.title} cover art`} />
        <button
          className="track-play"
          onClick={() => play(track, list)}
          aria-label={track.ytOnly ? `Watch ${track.title} on YouTube` : `${isPlaying ? 'Pause' : 'Play'} ${track.title}`}
        >
          {track.ytOnly ? <YouTubeIcon width={22} height={22} /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        {isPlaying && <span className="eq" aria-hidden="true"><i /><i /><i /></span>}
      </div>
      <div className="track-info">
        <div>
          <h3 className="track-title">{track.title}</h3>
          <p className="track-meta">
            {releaseYear(track)}{track.ytOnly ? ' · YouTube' : ''}
          </p>
        </div>
        {showDownload && track.can_download && (
          <button className="icon-btn icon-btn-sm" onClick={() => download(track)} aria-label={`Download ${track.title}`}>
            <DownloadIcon width={18} height={18} />
          </button>
        )}
      </div>
    </article>
  )
}
