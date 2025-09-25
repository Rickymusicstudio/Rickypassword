// api/share/news/[slug].js
// Returns an HTML page with OG tags for a given news slug, then redirects to /news/:slug

const SITE_ORIGIN =
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://rickypassword.com'

// helper to load your NEWS array from the frontend code
async function loadNews() {
  // adjust the path if your NEWS is stored elsewhere
  const mod = await import('../../../src/data/news.js') // relative to this file
  return mod.NEWS || []
}

function pickImage(post) {
  if (post?.cover_url) return post.cover_url
  if (Array.isArray(post?.images) && post.images.length) return post.images[0]
  // fallback image (site logo or a generic card)
  return `${SITE_ORIGIN}/favicon-512.png`
}

function summarize(htmlish, n = 160) {
  if (!htmlish) return ''
  const text = String(htmlish).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > n ? `${text.slice(0, n - 1)}…` : text
}

export default async function handler(req, res) {
  try {
    const slug = req.query.slug
    const news = await loadNews()
    const post = news.find(n => n.slug === slug)

    if (!post) {
      res.status(404).send('Not found')
      return
    }

    const canonical = `${SITE_ORIGIN}/news/${post.slug}`
    const title = post.title || 'News'
    const desc = summarize(post.content || '')
    const image = pickImage(post)

    // Basic HTML with OG + Twitter card tags and a meta refresh to the SPA route
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${image}">

  <meta http-equiv="refresh" content="0; url=${canonical}">
  <link rel="canonical" href="${canonical}">
  <style>
    body{font:16px system-ui, -apple-system, Segoe UI, Roboto, Arial; padding:24px}
    .card{max-width:640px;margin:0 auto}
    img{max-width:100%;border-radius:12px}
    p{opacity:.7}
    a{color:inherit}
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>Opening the article… If you’re not redirected, <a href="${canonical}">tap here</a>.</p>
    <img src="${image}" alt="">
  </div>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(200).send(html)
  } catch (e) {
    console.error(e)
    res.status(500).send('Server error')
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
 
