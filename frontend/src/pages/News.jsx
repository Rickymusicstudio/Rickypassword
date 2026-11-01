// src/pages/News.jsx
import { Link } from 'react-router-dom'
import { useContent } from '../data/ContentContext.jsx'
import { SOCIAL_LINKS, fmtDate } from '../lib/site'
import Img from '../components/Img.jsx'
import { ArrowIcon, InstagramIcon, YouTubeIcon } from '../components/Icons.jsx'

const newsImage = (p) => p.cover_url || p.images_share?.[0] || p.images?.[0] || ''

export default function News() {
  const [lead, ...rest] = useContent().news

  return (
    <div className="news-page">
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Latest</p>
          <h1 className="page-title">News</h1>
        </div>
      </header>

      <section className="container">
        {lead && (
          <Link to={`/news/${lead.slug}`} className="news-lead">
            <div className="news-lead-img">{newsImage(lead) && <Img src={newsImage(lead)} alt="" full />}</div>
            <div className="news-lead-body">
              <time className="eyebrow">{fmtDate(lead.date)}</time>
              <h2>{lead.title}</h2>
              {lead.excerpt && <p>{lead.excerpt}</p>}
              <span className="link-arrow">Read story <ArrowIcon width={18} height={18} /></span>
            </div>
          </Link>
        )}

        <div className="news-grid">
          {rest.map((p) => (
            <Link key={p.slug} to={`/news/${p.slug}`} className="news-card">
              <div className="news-card-img">{newsImage(p) && <Img src={newsImage(p)} alt="" />}</div>
              <div className="news-card-body">
                <time className="eyebrow">{fmtDate(p.date)}</time>
                <h3>{p.title}</h3>
                {p.excerpt && <p>{p.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>

        <div className="cta-band" style={{ marginTop: 48 }}>
          <div>
            <h2 className="cta-title">Never miss an update</h2>
            <p className="muted">New music, shows and studio updates from Ricky Password.</p>
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
      </section>
    </div>
  )
}
