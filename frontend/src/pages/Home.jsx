import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import Hero from '../components/Hero.jsx'
import artist from '/gallery/image17.jpg'

export default function Home() {
  const [firstProduct, setFirstProduct] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const prods = await api.products()
        setFirstProduct(Array.isArray(prods) && prods.length ? prods[0] : null)
      } catch (e) { console.error(e) }
    })()
  }, [])

  const playPreview = () => {
    alert('Play preview (wire to your /releases mp3 when ready)')
  }

  return (
    <>
      <Hero onPlay={playPreview} />

      <section id="about" className="section-white">
        <div className="container" style={{ padding: '64px 0' }}>
          <div className="about-grid">
            <img src={artist} alt="Artist" className="about-img" />
            <div>
              <h2 className="h2">Ricky Password</h2>
              <p className="lead">
                Ricky Password is a Rwandan artist who began his musical journey in 2011. Over the years, he has established himself as a vibrant voice in Rwanda’s contemporary music scene, blending creativity with energetic stage presence.
Early in his career, Ricky performed on some of Rwanda’s most prestigious stages, including the Kigali Up Festival and FESPAD (Pan-African Dance Festival). His talent soon earned him recognition beyond Rwanda, taking him to international stages where he showcased his artistry to diverse audiences.
In 2014, his dedication and originality were rewarded when he became a lauréat of VISA pour la Création, a prestigious cultural program supported by the French Institute, which spotlights promising artists from Africa and beyond.
Ricky’s catalog includes standout singles that resonate with both local and international fans. Among his most popular works is “Pretend” featuring Gabiro, a track that highlights his collaborative spirit and versatility in sound.

With a career rooted in passion and growth, Ricky Password continues to shape Rwanda’s music identity, inspiring audiences with his performances and songs that transcend borders.
              </p>
              {firstProduct && (
                <div style={{ marginTop: 24 }}>
                  <a href="/shop" className="btn" style={{ color: '#000', borderColor: 'rgba(0,0,0,.25)' }}>
                    Buy “{firstProduct.title}”
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
 
