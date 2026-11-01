// src/data/ContentContext.jsx — songs, news and gallery for the public site.
// Renders instantly from the last cached copy (or the built-in src/data/*.js files),
// then refreshes from Supabase when it is configured.
import { createContext, useContext, useEffect, useState } from 'react'
import { STATIC_TRACKS, sortTracks } from './tracks'
import { NEWS } from './news'
import { GALLERY } from './gallery'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const enabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

const CACHE_KEY = 'rp:content:v1'

const sortNews = (list) => [...list].sort((a, b) => new Date(b.date) - new Date(a.date))

const STATIC = {
  tracks: STATIC_TRACKS,
  news: sortNews(NEWS),
  gallery: GALLERY.map((g) => ({ ...g, src: g.src || (g.file ? `/gallery/${g.file}` : '') }))
    .filter((g) => g.src)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
}

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || null } catch { return null }
}

// database rows → the shapes the pages already use
const fromDb = {
  news: (r) => ({
    id: r.id, slug: r.slug, title: r.title, date: r.date, excerpt: r.excerpt || '',
    content: r.content || '', cover_url: r.cover_url || '', images_share: r.images || [],
  }),
  gallery: (r) => ({ id: r.id, src: r.image_url, caption: r.caption || '', date: r.taken_on }),
}

// Plain REST reads keep supabase-js (≈150 KB) out of the public bundle; only /admin loads it.
async function rest(query) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  })
  if (!r.ok) throw new Error(`${query.split('?')[0]}: HTTP ${r.status}`)
  return r.json()
}

async function fetchContent() {
  const [songs, news, gallery] = await Promise.all([
    rest('songs?select=*&published=eq.true'),
    rest('news?select=*&published=eq.true'),
    rest('gallery?select=*&order=taken_on.desc.nullslast,created_at.desc'),
  ])
  return {
    tracks: sortTracks(songs),
    news: sortNews(news.map(fromDb.news)),
    gallery: gallery.map(fromDb.gallery),
  }
}

const ContentContext = createContext(STATIC)

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => (enabled && readCache()) || STATIC)

  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchContent()
      .then((db) => {
        // Until the old content is imported, keep showing the built-in lists for empty tables.
        const next = {
          tracks: db.tracks.length ? db.tracks : STATIC.tracks,
          news: db.news.length ? db.news : STATIC.news,
          gallery: db.gallery.length ? db.gallery : STATIC.gallery,
        }
        if (!alive) return
        setContent(next)
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)) } catch { /* storage blocked */ }
      })
      .catch((e) => console.warn('[content] using built-in data:', e.message))
    return () => { alive = false }
  }, [])

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useContent = () => useContext(ContentContext)
