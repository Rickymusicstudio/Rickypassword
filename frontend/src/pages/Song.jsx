// src/pages/Song.jsx — full "now playing" page for one song, with a shareable link (/music/:slug)
import { useEffect } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { usePlayer } from '../player/PlayerContext.jsx'
import { useContent } from '../data/ContentContext.jsx'
import { mediaUrl } from '../data/tracks'
import { fmtDate } from '../lib/site'
import Img from '../components/Img.jsx'
import ShareBox from '../components/ShareBox.jsx'
import { Comments, LikeButton } from '../components/SongEngagement.jsx'
import { canEngage } from '../lib/engagement'
import TrackCard from '../components/TrackCard.jsx'
import { ArrowIcon, DownloadIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon, YouTubeIcon } from '../components/Icons.jsx'

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function Song() {
  const { slug } = useParams()
  const location = useLocation()
  const { tracks } = useContent()
  const { current, playing, time, play, toggle, seek, download } = usePlayer()

  const index = tracks.findIndex((t) => t.slug === slug)
  const track = tracks[index]
  const isCurrent = track && current?.sku === track.sku
  const isPlaying = isCurrent && playing

  // Opened by tapping a song on the site: start it. (Shared links wait for the visitor to press play.)
  useEffect(() => {
    if (track && location.state?.autoplay && !isCurrent && !track.ytOnly) play(track, tracks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.sku])

  useEffect(() => {
    if (track) document.title = `${track.title} — Ricky Password`
    return () => { document.title = 'Ricky Password — Official Site' }
  }, [track])

  if (!track) return <Navigate to="/music" replace />

  const prevTrack = tracks[(index - 1 + tracks.length) % tracks.length]
  const nextTrack = tracks[(index + 1) % tracks.length]
  const shareUrl = `${window.location.origin}/music/${track.slug}`
  const pct = isCurrent && time.duration ? (time.current / time.duration) * 100 : 0
  const more = tracks.filter((t) => t.sku !== track.sku).slice(0, 8)
  const social = canEngage(track)

  return (
    <div className="song-page">
      <div className="song-bg" style={{ backgroundImage: `url("${mediaUrl(track.cover_url)}")` }} aria-hidden="true" />

      <div className="container">
        <Link to="/music" className="link-arrow song-back">
          <ArrowIcon width={18} height={18} style={{ transform: 'rotate(180deg)' }} /> All music
        </Link>

        <div className="song-main">
          <div className={`song-art ${isPlaying ? 'is-playing' : ''}`}>
            <Img src={track.cover_url} alt={`${track.title} cover art`} full />
          </div>

          <div className="song-info">
            <p className="eyebrow">{track.released_at ? `Single · ${fmtDate(track.released_at, { month: 'long', year: 'numeric' })}` : 'Single'}</p>
            <h1 className="song-title">{track.title}</h1>
            <p className="song-artist">Ricky Password</p>

            {track.ytOnly ? (
              <div className="song-controls">
                <button className="btn btn-primary song-play-wide" onClick={() => play(track)}>
                  <YouTubeIcon width={20} height={20} /> Watch on YouTube
                </button>
                {social && <LikeButton track={track} />}
              </div>
            ) : (
              <>
                <div className="song-progress" style={{ '--pct': `${pct}%` }}>
                  <input
                    type="range"
                    min={0}
                    max={isCurrent ? time.duration || 0 : 0}
                    step="0.1"
                    value={isCurrent ? time.current : 0}
                    onChange={(e) => isCurrent && seek(Number(e.target.value))}
                    disabled={!isCurrent}
                    aria-label="Seek"
                  />
                  <div className="song-times">
                    <span>{fmt(isCurrent ? time.current : 0)}</span>
                    <span>{isCurrent ? fmt(time.duration) : '--:--'}</span>
                  </div>
                </div>

                <div className="song-controls">
                  <Link className="icon-btn" to={`/music/${prevTrack.slug}`} state={{ autoplay: isPlaying }} aria-label={`Previous: ${prevTrack.title}`}>
                    <PrevIcon />
                  </Link>
                  <button
                    className="song-play"
                    onClick={() => (isCurrent ? toggle() : play(track, tracks))}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <PauseIcon width={30} height={30} /> : <PlayIcon width={30} height={30} />}
                  </button>
                  <Link className="icon-btn" to={`/music/${nextTrack.slug}`} state={{ autoplay: isPlaying }} aria-label={`Next: ${nextTrack.title}`}>
                    <NextIcon />
                  </Link>
                  {social && <LikeButton track={track} />}
                  {track.can_download && (
                    <button className="btn btn-ghost btn-sm song-download" onClick={() => download(track)}>
                      <DownloadIcon width={18} height={18} /> Download
                    </button>
                  )}
                </div>
              </>
            )}

            <ShareBox url={shareUrl} title={`${track.title} — Ricky Password`} text={`Listen to "${track.title}" by Ricky Password 🎶`} />
          </div>
        </div>

        {social && <Comments track={track} />}

        {more.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2 className="section-title">More from Ricky Password</h2>
              <Link to="/music" className="link-arrow">All music <ArrowIcon width={18} height={18} /></Link>
            </div>
            <div className="rail">
              {more.map((t) => <TrackCard key={t.sku} track={t} list={tracks} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
