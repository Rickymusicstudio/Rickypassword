// api/og/news/[slug].js
// ESM only. Ensure "type": "module" exists in package.json
import { NEWS } from "../../../src/data/news.js"; // <- uses your source of truth

export default function handler(req, res) {
  try {
    const { slug } = req.query || {};
    if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

    // Find item by slug
    const item = (Array.isArray(NEWS) ? NEWS : []).find(n => n.slug === slug);
    if (!item) return res.status(404).json({ ok: false, error: "Not found" });

    // Map your fields
    const title       = item.title || "Ricky Password";
    const description = item.excerpt || "News";
    const image       = toAbs(item.cover_url) || "";
    // Your on-site UI page for reading the article:
    const prettyUrl   = `https://rickypassword.com/news/${encodeURIComponent(slug)}`;

    // Cache a bit (tweak as you like)
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");

    // If a client asks json, return the object (handy for debugging)
    const accept = String(req.headers["accept"] || "").toLowerCase();
    if (accept.includes("application/json")) {
      return res.status(200).json({ ok: true, item });
    }

    // Minimal OG/Twitter HTML + instant redirect for humans
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escHtml(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${escHtml(description)}" />

<!-- Open Graph -->
<meta property="og:type" content="article" />
<meta property="og:title" content="${escHtml(title)}" />
<meta property="og:description" content="${escHtml(description)}" />
${image ? `<meta property="og:image" content="${escAttr(image)}" />` : ""}
<meta property="og:url" content="${escAttr(prettyUrl)}" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escHtml(title)}" />
<meta name="twitter:description" content="${escHtml(description)}" />
${image ? `<meta name="twitter:image" content="${escAttr(image)}" />` : ""}

<link rel="canonical" href="${escAttr(prettyUrl)}" />
<meta http-equiv="refresh" content="0; url=${escAttr(prety(prettyUrl))}" />
<style>
  :root { color-scheme: light dark; }
  body { font-family: ui-sans-serif, system-ui; padding: 24px; }
  .card { max-width: 720px; margin: 0 auto; }
  img { max-width: 100%; border-radius: 12px; }
  a { color: inherit; }
</style>
</head>
<body>
  <div class="card">
    <h1>${escHtml(title)}</h1>
    <p>${escHtml(description)}</p>
    <p><a href="${escAttr(prettyUrl)}">Open this post</a></p>
    ${image ? `<img src="${escAttr(image)}" alt="${escAttr(title)}" />` : ""}
  </div>
  <script>location.replace(${JSON.stringify(prettyUrl)});</script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

/* utils */
function escHtml(s = "") {
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function escAttr(s = "") {
  return String(s).replaceAll('"',"&quot;");
}
function prety(u=""){ return String(u).replaceAll('"',"&quot;"); } // for meta refresh
function toAbs(u=""){
  if (!u) return "";
  // already absolute
  if (/^https?:\/\//i.test(u)) return u;
  // make site-absolute
  if (u.startsWith("/")) return `https://rickypassword.com${u}`;
  return `https://rickypassword.com/${u}`;
}
