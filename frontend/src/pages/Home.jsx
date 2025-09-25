// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import artist from '/gallery/image17.jpg'

export default function Home() {
  const navigate = useNavigate()
  const goToMusic = () => navigate('/music')

  return (
    <main className="home-page">
      {/* Hero sits under the fixed header; Play -> /music */}
      <Hero onPlay={goToMusic} />

      {/* About */}
      <section id="about" className="section-white">
        <div className="container" style={{ paddingBlock: '56px' }}>
          <div className="about-grid">
            <img
              src={artist}
              alt="Ricky Password portrait"
              className="about-img"
              loading="lazy"
              decoding="async"
            />
            <div>
              <h2 className="h2">Ricky Password</h2>
              <p className="lead">
                Ricky Password is a Rwandan artist who began his musical journey in 2011. Over the years, he has
                established himself as a vibrant voice in Rwanda’s contemporary music scene, blending creativity with
                energetic stage presence. Early in his career, Ricky performed on prestigious stages such as Kigali Up
                Festival and FESPAD. In 2014, he became a lauréat of VISA pour la Création (French Institute), earning
                recognition beyond Rwanda. Notable works include “Pretend” featuring Gabiro, reflecting his collaborative
                spirit and versatility. With passion and steady growth, Ricky continues to shape Rwanda’s music identity,
                inspiring audiences with performances and songs that cross borders.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
