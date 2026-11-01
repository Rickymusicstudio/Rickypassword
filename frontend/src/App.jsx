// src/App.jsx
import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { ContentProvider } from './data/ContentContext.jsx'
import { PlayerProvider } from './player/PlayerContext.jsx'
import PlayerBar from './player/PlayerBar.jsx'

/* -------- Public pages -------- */
import Home from './pages/Home.jsx'
import Music from './pages/Music.jsx'
import Shows from './pages/Shows.jsx'
import News from './pages/News.jsx'
import NewsPost from './pages/NewsPost.jsx'
import Gallery from './pages/Gallery.jsx'
import Bio from './pages/Bio.jsx'
import Contact from './pages/Contact.jsx'

/* -------- Admin pages (split into their own chunk; fans never download them) -------- */
const AdminLogin = lazy(() => import('./pages/admin/Login.jsx'))
const Admin = lazy(() => import('./pages/admin/Admin.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

/* Public layout: wraps pages with site chrome + the persistent player */
function PublicLayout() {
  return (
    <ContentProvider>
      <PlayerProvider>
        <ScrollToTop />
        <a className="skip-link" href="#content">Skip to content</a>
        <Header />
        <main id="content">
          <Outlet />
        </main>
        <Footer />
        <PlayerBar />
      </PlayerProvider>
    </ContentProvider>
  )
}

/* Admin layout: Admin.jsx renders its own shell (no site chrome here) */
function AdminLayout() {
  return (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/music" element={<Music />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsPost />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/bio" element={<Bio />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Admin area */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="login" element={<AdminLogin />} />
        <Route index element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
