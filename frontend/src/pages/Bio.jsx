// src/pages/Bio.jsx
export default function Bio() {
  return (
    <main className="bio-page">
      {/* Page header aligned to gutters */}
      <header className="page-head">
        <div className="container">
          <h1 className="page-title">Bio</h1>
        </div>
      </header>

      {/* Content */}
      <section className="section-white">
        <div className="container" style={{ paddingBlock: '56px' }}>
          <div className="about-grid">
            {/* NOTE: public files should be referenced WITHOUT /public */}
            <img
              src="/gallery/image17.jpg"
              alt="Ricky Password"
              className="about-img"
              loading="lazy"
              decoding="async"
            />

            <div>
              <h2 className="h2" style={{ marginTop: 0 }}>Ricky Password</h2>

              <p className="lead">
                Ricky Password is a Rwandan artist who began his musical journey in 2011.
                Over the years, he has established himself as a vibrant voice in Rwanda’s contemporary music scene,
                blending creativity with energetic stage presence. Early in his career, Ricky performed on some of Rwanda’s
                most prestigious stages, including the Kigali Up Festival and FESPAD (Pan-African Dance Festival). His talent soon
                earned him recognition beyond Rwanda, taking him to international stages where he showcased his artistry to diverse
                audiences. In 2014, his dedication and originality were rewarded when he became a lauréat of VISA pour la Création,
                a prestigious cultural program supported by the French Institute, spotlighting promising artists from Africa and beyond.
                Ricky’s catalog includes standout singles that resonate with both local and international fans. Among his most popular
                works is “Pretend” featuring Gabiro, a track that highlights his collaborative spirit and versatility in sound. With a
                career rooted in passion and growth, Ricky Password continues to shape Rwanda’s music identity, inspiring audiences with
                performances and songs that transcend borders.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
