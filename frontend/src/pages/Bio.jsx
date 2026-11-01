// src/pages/Bio.jsx
import { Link } from 'react-router-dom'
import Img from '../components/Img.jsx'

const FACTS = [
  { value: '2011', label: 'Career began' },
  { value: '2014', label: 'VISA pour la Création lauréat' },
  { value: 'FESPAD', label: 'and Kigali Up Festival' },
]

export default function Bio() {
  return (
    <div className="bio-page">
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">The artist</p>
          <h1 className="page-title">Bio</h1>
        </div>
      </header>

      <section className="container about-grid">
        <Img src="/gallery/image17.jpg" alt="Ricky Password" className="about-img" full />

        <div>
          <h2 className="section-title">Ricky Password</h2>
          <p className="lead">
            Ricky Password is a Rwandan artist who began his musical journey in 2011.
            Over the years, he has established himself as a vibrant voice in Rwanda’s contemporary music scene,
            blending creativity with energetic stage presence. Early in his career, Ricky performed on some of Rwanda’s
            most prestigious stages, including the Kigali Up Festival and FESPAD (Pan-African Dance Festival). His talent soon
            earned him recognition beyond Rwanda, taking him to international stages where he showcased his artistry to diverse
            audiences.
          </p>
          <p className="lead">
            In 2014, his dedication and originality were rewarded when he became a lauréat of VISA pour la Création,
            a prestigious cultural program supported by the French Institute, spotlighting promising artists from Africa and beyond.
            Ricky’s catalog includes standout singles that resonate with both local and international fans. Among his most popular
            works is “Pretend” featuring Gabiro, a track that highlights his collaborative spirit and versatility in sound.
          </p>
          <p className="lead">
            With a career rooted in passion and growth, Ricky Password continues to shape Rwanda’s music identity, inspiring
            audiences with performances and songs that transcend borders.
          </p>

          <div className="facts">
            {FACTS.map((f) => (
              <div className="fact" key={f.value}><strong>{f.value}</strong><span>{f.label}</span></div>
            ))}
          </div>

          <div className="cta-actions" style={{ marginTop: 28 }}>
            <Link to="/music" className="btn btn-primary">Listen to the music</Link>
            <Link to="/contact" className="btn btn-ghost">Booking &amp; press</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
