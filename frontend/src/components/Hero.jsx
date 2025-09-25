// src/components/Hero.jsx
import heroImg from '../assets/hero.jpg';
import cover from '../assets/star_cover.jpg';
import { Link } from 'react-router-dom';

export default function Hero({
  title = 'RICKY PASSWORD',
  subtitle = 'Latest Release',
  trackTitle = 'STAR',
}) {
  return (
    <section className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
      <div className="hero-blob" />
      <div className="container hero-content">
        <h1 className="hero-title">{title}</h1>

        <div className="player">
          <img src={cover} alt={`${trackTitle} cover`} />
          <div style={{ flex: 1 }}>
            <div className="player-sub">{subtitle}</div>
            <div className="player-title">{trackTitle}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {/* Single action: go to Music */}
              <Link to="/music" className="btn btn-solid">
                Play
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
