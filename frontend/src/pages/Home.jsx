// src/pages/Home.jsx
import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import TrackCard from '../components/TrackCard.jsx'
import Img from '../components/Img.jsx'
import { ArrowIcon, InstagramIcon, YouTubeIcon } from '../components/Icons.jsx'
import { useContent } from '../data/ContentContext.jsx'
import { SOCIAL_LINKS, fmtDate } from '../lib/site'

const newsImage = (p) => p.cover_url || p.images_share?.[0] || p.images?.[0] || ''

export default function Home() {
  const { tracks, news } = useContent()
  const latestNews = news.slice(0, 3)

  return (
    <div className="home-page">
      <Hero />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Latest releases</h2>
            <Link to="/music" className="link-arrow">All music <ArrowIcon width={18} height={18} /></Link>
          </div>
          <div className="rail">
            {tracks.slice(0, 8).map((t) => <TrackCard key={t.sku} track={t} />)}
          </div>
        </div>
      </section>

      {latestNews.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head">
              <h2 className="section-title">News</h2>
              <Link to="/news" className="link-arrow">All news <ArrowIcon width={18} height={18} /></Link>
            </div>
            <div className="news-grid">
              {latestNews.map((p) => (
                <Link key={p.slug} to={`/news/${p.slug}`} className="news-card">
                  <div className="news-card-img">
                    {newsImage(p) && <Img src={newsImage(p)} alt="" />}
                  </div>
                  <div className="news-card-body">
                    <time className="eyebrow">{fmtDate(p.date)}</time>
                    <h3>{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container about-grid">
          <Img src="/gallery/image17.jpg" alt="Ricky Password portrait" className="about-img" />
          <div>
            <p className="eyebrow">About</p>
            <h2 className="section-title">A vibrant voice in Rwanda's music scene</h2>
            <p className="lead">
              Ricky Password began his musical journey in 2011, blending creativity with an energetic stage presence.
              He has performed at Kigali Up Festival and FESPAD, and in 2014 became a lauréat of VISA pour la Création
              (French Institute). Notable works include “Pretend” featuring Gabiro.
            </p>
            <Link to="/bio" className="btn btn-ghost">Read the full bio <ArrowIcon width={18} height={18} /></Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2 className="cta-title">Never miss a drop</h2>
              <p className="muted">New music, shows and studio moments, first on YouTube and Instagram.</p>
            </div>
            <div className="cta-actions">
              <a className="btn btn-primary" href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer">
                <YouTubeIcon width={18} height={18} /> Subscribe
              </a>
              <a className="btn btn-ghost" href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
                <InstagramIcon width={18} height={18} /> Follow
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
