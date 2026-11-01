// src/components/Hero.jsx — full-bleed hero with the latest release
import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.webp'
import { usePlayer } from '../player/PlayerContext.jsx'
import { TRACKS, mediaUrl } from '../data/tracks'
import { ArrowIcon, PauseIcon, PlayIcon } from './Icons.jsx'

export default function Hero() {
  const { current, playing, play } = usePlayer()
  const latest = TRACKS[0]
  const isPlaying = latest && current?.sku === latest.sku && playing

  return (
    <section className="hero">
      <img className="hero-bg" src={heroImg} alt="" fetchPriority="high" />
      <div className="container hero-content">
        <p className="eyebrow reveal">Rwandan artist · Kigali</p>
        <h1 className="hero-title reveal" style={{ '--d': '80ms' }}>
          Ricky<br /><span>Password</span>
        </h1>

        {latest && (
          <div className="hero-release reveal" style={{ '--d': '160ms' }}>
            <img src={mediaUrl(latest.cover_url)} alt="" />
            <div className="hero-release-text">
              <span className="eyebrow">Latest release</span>
              <strong>{latest.title}</strong>
            </div>
            <button className="btn btn-primary" onClick={() => play(latest)}>
              {isPlaying ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
              {isPlaying ? 'Pause' : 'Play now'}
            </button>
          </div>
        )}

        <Link to="/music" className="hero-more reveal" style={{ '--d': '240ms' }}>
          All music <ArrowIcon width={18} height={18} />
        </Link>
      </div>
    </section>
  )
}
