/* global process */
// api/og.js — Vercel function: share preview (Open Graph) page for a news article or a song.
// WhatsApp/Facebook/X bots are routed here by vercel.json (?type=song for /music/:slug);
// people are redirected to the real page. Reads from Supabase; news falls back to /og/news/.
import { slugify } from '../src/lib/site.js'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Links point at whichever domain served the request (custom domain or *.vercel.app).
function siteOf(req) {
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host
  return host ? `https://${String(host).split(',')[0].trim()}` : 'https://rickypassword.vercel.app'
}
// Built-in covers/photos have a small "<name>-og.jpg" twin (npm run images); WhatsApp skips big images.
const shareImage = (u) => (u && /^\/(covers|gallery)\/[^?]+\.(jpe?g|png)$/i.test(u) ? u.replace(/\.(jpe?g|png)$/i, '-og.jpg') : u)
const abs = (site, u) => (!u ? '' : /^https?:\/\//i.test(u) ? u : site + (u.startsWith('/') ? '' : '/') + encodeURI(u))

async function rest(query) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  const r = await fetch(`${url}/rest/v1/${query}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  return r.ok ? r.json() : null
}

async function findArticle(slug) {
  const rows = await rest(`news?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=title,excerpt,cover_url,images&limit=1`)
  const it = rows?.[0]
  return it && { title: it.title, desc: it.excerpt || 'News from Ricky Password', image: it.cover_url || it.images?.[0], path: `/news/${slug}`, type: 'article' }
}

async function findSong(slug) {
  const rows = await rest('songs?published=eq.true&select=title,cover_url,released_at')
  const it = rows?.find((s) => slugify(s.title) === slug)
  return it && { title: `${it.title} — Ricky Password`, desc: `Listen to "${it.title}" by Ricky Password`, image: it.cover_url, path: `/music/${slug}`, type: 'music.song' }
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || '').replace(/\.html$/, '')
  const isSong = req.query.type === 'song'
  if (!/^[a-z0-9-]+$/.test(slug)) return res.redirect(302, isSong ? '/music' : '/news')

  let item = null
  try { item = await (isSong ? findSong(slug) : findArticle(slug)) } catch { /* fall back below */ }
  if (!item) return res.redirect(302, isSong ? `/music/${slug}` : `/og/news/${slug}.html`)

  const site = siteOf(req)
  const page = site + item.path
  const img = abs(site, shareImage(item.image))

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
  res.status(200).send(`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><title>${esc(item.title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(item.desc)}">
<meta property="og:type" content="${item.type}"><meta property="og:site_name" content="Ricky Password">
<meta property="og:title" content="${esc(item.title)}"><meta property="og:description" content="${esc(item.desc)}">
${img ? `<meta property="og:image" content="${esc(img)}">` : ''}
<meta property="og:url" content="${esc(page)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${esc(page)}">
<meta http-equiv="refresh" content="0; url=${esc(page)}">
</head><body><script>location.replace(${JSON.stringify(page)})</script></body></html>`)
}
