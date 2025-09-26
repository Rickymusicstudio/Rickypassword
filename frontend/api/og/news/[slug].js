// api/og/news/[slug].js
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadNews() {
  const file = resolve(process.cwd(), "public", "news.json");
  const data = JSON.parse(readFileSync(file, "utf8"));
  return Array.isArray(data.items) ? data.items : [];
}

export default function handler(req, res) {
  try {
    const { slug } = req.query || {};
    if (!slug) {
      res.status(400).json({ ok: false, error: "Missing slug" });
      return;
    }

    const items = loadNews();
    const item = items.find(x => x.slug === slug);

    if (!item) {
      res.status(404).json({ ok: false, error: "Not found" });
      return;
    }

    const title = item.title || "Ricky Password";
    const description = item.description || "News";
    const image = item.image || "";
    // Where you want humans to land (your UI route for this post)
    const prettyUrl =
      item.url ||
      `https://rickypassword.com/share/news/${encodeURIComponent(slug)}`;

    // Good caching for bots/CDNs (adjust as you like)
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");

    // If caller prefers JSON (e.g., API test), serve JSON
    const accept = (req.headers["accept"] || "").toLowerCase();
    if (accept.includes("application/json")) {
      res.status(200).json({ ok: true, item });
      return;
    }

    // Full OG/Twitter HTML
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escHtml(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escHtml(description)}">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(description)}">
${image ? `<meta property="og:image" content="${escAttr(image)}">` : ""}
<meta property="og:url" content="${escAttr(prettyUrl)}">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escHtml(title)}">
<meta name="twitter:description" content="${escHtml(description)}">
${image ? `<meta name="twitter:image" content="${escAttr(image)}">` : ""}

<link rel="canonical" href="${escAttr(prettyUrl)}">
<meta http-equiv="refresh" content="0; url=${escAttr(prettyUrl)}" />
<style>
  :root { color-scheme: light dark; }
  body{font-family: ui-sans-serif, system-ui; margin:0; padding:24px;}
  .card{max-width:720px; margin:0 auto;}
  img{max-width:100%; border-radius:12px;}
  a{color:inherit}
</style>
</head>
<body>
  <div class="card">
    <h1>${escHtml(title)}</h1>
    <p>${escHtml(description)}</p>
    <p><a href="${escAttr(prettyUrl)}">Open this post</a></p>
    ${image ? `<img src="${escAttr(image)}" alt="${escAttr(title)}">` : ""}
  </div>
  <script>location.replace(${JSON.stringify(prettyUrl)});</script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

function escHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function escAttr(s = "") {
  return String(s).replaceAll('"', "&quot;");
}
