// src/pages/Music.jsx
import { Link } from 'react-router-dom'
import { usePlayer } from '../player/PlayerContext.jsx'
import TrackCard from '../components/TrackCard.jsx'
import Img from '../components/Img.jsx'
import { DownloadIcon, PauseIcon, PlayIcon } from '../components/Icons.jsx'
import { useContent } from '../data/ContentContext.jsx'
import { fmtDate } from '../lib/site'

export default function Music() {
  const { current, playing, play, download } = usePlayer()
  const { tracks } = useContent()
  const [latest, ...rest] = tracks
  const latestPlaying = latest && current?.sku === latest.sku && playing

  return (
    <div className="music-page">
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Discography</p>
          <h1 className="page-title">Music</h1>
          <p className="page-intro">
            {tracks.length} tracks. Press play and keep browsing; the player follows you around the site.
          </p>
        </div>
      </header>

      <section className="container">
        {latest ? (
          <>
            <div className="feature">
              <div className="feature-art">
                <Link to={`/music/${latest.slug}`} state={{ autoplay: true }} aria-label={`Open ${latest.title}`}>
                  <Img src={latest.cover_url} alt={`${latest.title} cover art`} full />
                </Link>
              </div>
              <div>
                <p className="eyebrow">Latest release · {fmtDate(latest.released_at, { month: 'long', year: 'numeric' })}</p>
                <h2 className="feature-title"><Link to={`/music/${latest.slug}`} className="link-plain">{latest.title}</Link></h2>
                <p className="muted">Ricky Password</p>
                <div className="feature-actions">
                  <button className="btn btn-primary" onClick={() => play(latest, tracks)}>
                    {latestPlaying ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
                    {latestPlaying ? 'Pause' : 'Play'}
                  </button>
                  {latest.can_download && (
                    <button className="btn btn-ghost" onClick={() => download(latest)}>
                      <DownloadIcon width={18} height={18} /> Download
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="section-head">
              <h2 className="section-title">All tracks</h2>
            </div>
            <div className="music-grid">
              {rest.map((t) => <TrackCard key={t.sku} track={t} list={tracks} showDownload />)}
            </div>
          </>
        ) : (
          <p className="muted">No music yet.</p>
        )}
      </section>
    </div>
  )
}
