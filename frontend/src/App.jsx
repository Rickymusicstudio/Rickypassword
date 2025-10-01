// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

import Home from './pages/Home.jsx'
import Music from './pages/Music.jsx'
import Shows from './pages/Shows.jsx'
import News from './pages/News.jsx'
import NewsPost from './pages/NewsPost.jsx'   // <-- added
import Gallery from './pages/Gallery.jsx'
import Bio from './pages/Bio.jsx'
import Contact from './pages/Contact.jsx'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Music */}
          <Route path="/music" element={<Music />} />

          {/* Shows */}
          <Route path="/shows" element={<Shows />} />

          {/* News (list + detail) */}
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsPost />} />  {/* <-- new detail route */}

          {/* Other pages */}
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/bio" element={<Bio />} />
          <Route path="/contact" element={<Contact />} />

          {/* Optional: simple catch-all -> Home (or make a NotFound page) */}
          {/* <Route path="*" element={<Home />} /> */}
        </Routes>
      </main>
      <Footer />
    </>
  )
}
