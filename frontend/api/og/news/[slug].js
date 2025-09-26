// api/og/news/[slug].js
// Returns a minimal HTML page with Open Graph tags for a given news slug
// and meta-refreshes humans to the real SPA route.

const SITE_ORIGIN = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://rickypassword.com';

async function loadNews() {
  const origin = "https://rickypassword.com"; // hardcode your site
  const res = await fetch(`${origin}/news.json`);
  if (!res.ok) return [];
  return await res.json();
}

function pickImage(post) {
  if (post?.cover_url) return post.cover_url;
  if (Array.isArray(post?.images) && post.images.length) return post.images[0];
  return `${SITE_ORIGIN}/favicon-512.png`;
}

function summarize(htmlish, n = 160) {
  if (!htmlish) return '';
  const text = String(htmlish).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > n ? `${text.slice(0, n - 1)}…` : text;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  try {
    const slug = req.query.slug;
    const all = await loadNews();
    const post = all.find(n => n.slug === slug);
    if (!post) {
      res.status(404).send('<!doctype html><title>Not found</title>Not found');
      return;
    }

    const canonical = `${SITE_ORIGIN}/news/${post.slug}`;
    const title = post.title || 'News';
    const desc = summarize(post.content || '');
    const image = pickImage(post); // MUST be a public HTTPS URL

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="${canonical}">

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
</head>
<body></body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send('<!doctype html><title>Error</title>Server error');
  }
}
