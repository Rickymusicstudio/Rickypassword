// api/s/[slug].js
// Ensure package.json has: { "type": "module" }
import fs from "node:fs";
import path from "node:path";

// --- Load items from src/data/news.js (primary) ---
let itemsFromModule = [];
try {
  // top-level dynamic import so we can catch errors cleanly
  const mod = await import("../../src/data/news.js");
  const arr = mod?.NEWS ?? mod?.default;
  if (Array.isArray(arr)) itemsFromModule = arr;
} catch (e) {
  // ignore, we'll try fallback below
}

// --- Fallback: load from public/news.json if it exists ---
function loadFromPublic() {
  try {
    const p = path.resolve(process.cwd(), "public", "news.json");
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf8");
      const json = JSON.parse(raw);
      if (Array.isArray(json?.items)) return json.items;
      if (Array.isArray(json)) return json;
    }
  } catch {
    // ignore
  }
  return [];
}

const ITEMS = itemsFromModule.length ? itemsFromModule : loadFromPublic();

export default function handler(req, res) {
  try {
    const { slug } = req.query || {};

    // Debug helper: /api/s/anything?debug=1 → show what the server sees
    if (req.query?.debug === "1") {
      return res.status(200).json({
        ok: true,
        count: ITEMS.length,
        slugs: ITEMS.map(x => x.slug),
        using: itemsFromModule.length ? "src/data/news.js" : "public/news.json"
      });
    }

    if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

    const item = ITEMS.find(n => n.slug === slug);
    if (!item) return res.status(404).json({ ok: false, error: "Not found" });

    const title = item.title || "Ricky Password";
    const description = item.excerpt || "News";
    const image = toAbs(item.cover_url || (Array.isArray(item.images) && item.images[0]) || "");
    const prettyUrl = `https://rickypassword.com/news/${encodeURIComponent(slug)}`;

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");

    // If the client explicitly wants JSON, return item JSON (no redirect)
    const accept = String(req.headers["accept"] || "").toLowerCase();
    if (accept.includes("application/json")) {
      return res.status(200).json({ ok: true, item, prettyUrl, image });
    }

    // Otherwise return OG HTML and auto-redirect humans
    const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>${escHtml(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${escHtml(description)}" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="Ricky Password" />
<meta property="og:title" content="${escHtml(title)}" />
<meta property="og:description" content="${escHtml(description)}" />
${image ? `<meta property="og:image" content="${escAttr(image)}" />` : ""}
<meta property="og:url" content="${escAttr(prettyUrl)}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escHtml(title)}" />
<meta name="twitter:description" content="${escHtml(description)}" />
${image ? `<meta name="twitter:image" content="${escAttr(image)}" />` : ""}

<link rel="canonical" href="${escAttr(prettyUrl)}" />
<meta http-equiv="refresh" content="0; url=${escAttr(prettyUrl)}" />
</head><body>
<script>location.replace(${JSON.stringify(prettyUrl)});</script>
</body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

/* helpers */
function escHtml(s=""){ return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;") }
function escAttr(s=""){ return String(s).replaceAll('"',"&quot;") }
function toAbs(u=""){
  if(!u) return "";
  if(/^https?:\/\//i.test(u)) return u;
  if(u.startsWith("/")) return `https://rickypassword.com${u}`;
  return `https://rickypassword.com/${u}`;
}
