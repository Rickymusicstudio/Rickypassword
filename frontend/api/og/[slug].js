/* global process */
// api/og/[slug].js — Vercel function: share preview (Open Graph) page for a news article.
// WhatsApp/Facebook/X bots are routed here by vercel.json; people are redirected to the article.
// Reads the article from Supabase; falls back to the build-time page in /og/news/.
const SITE = 'https://rickypassword.com'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const abs = (u) => (!u ? '' : /^https?:\/\//i.test(u) ? u : SITE + (u.startsWith('/') ? '' : '/') + encodeURI(u))

async function findArticle(slug) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) return null
  const q = `${url}/rest/v1/news?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=slug,title,excerpt,cover_url,images&limit=1`
  const r = await fetch(q, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!r.ok) return null
  const rows = await r.json()
  return rows[0] || null
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || '').replace(/\.html$/, '')
  if (!/^[a-z0-9-]+$/.test(slug)) return res.redirect(302, '/news')

  let item = null
  try { item = await findArticle(slug) } catch { /* fall back below */ }
  if (!item) return res.redirect(302, `/og/news/${slug}.html`)

  const page = `${SITE}/news/${slug}`
  const img = abs(item.cover_url || item.images?.[0])
  const title = esc(item.title)
  const desc = esc(item.excerpt || 'News from Ricky Password')

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400')
  res.status(200).send(`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${desc}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Ricky Password">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
${img ? `<meta property="og:image" content="${esc(img)}">` : ''}
<meta property="og:url" content="${esc(page)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${esc(page)}">
<meta http-equiv="refresh" content="0; url=${esc(page)}">
</head><body><script>location.replace(${JSON.stringify(page)})</script></body></html>`)
}
