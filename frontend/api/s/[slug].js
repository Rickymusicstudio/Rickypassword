// tools/build-og.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = "https://rickypassword.com";

const esc  = s => String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const attr = s => String(s ?? "").replaceAll('"',"&quot;");
const abs  = u => !u ? "" : /^https?:\/\//i.test(u) ? u : (u.startsWith("/") ? SITE+u : SITE+"/"+u);

function loadItems() {
  // Prefer the public JSON if present
  const pj = path.join(ROOT, "public", "news.json");
  if (fs.existsSync(pj)) {
    const raw = JSON.parse(fs.readFileSync(pj, "utf8"));
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
    return items;
  }
  // Fallback to source list
  try {
    const { NEWS } = require(path.join(ROOT, "src", "data", "news.js"));
    return Array.isArray(NEWS) ? NEWS : [];
  } catch {
    return [];
  }
}

function htmlFor(it) {
  const title = it.title || "Ricky Password";
  const desc  = it.excerpt || "News";
  const img   = abs(it.cover_url || (Array.isArray(it.images) && it.images[0]) || "");
  const pretty= `${SITE}/news/${encodeURIComponent(it.slug)}`;

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Ricky Password">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
${img ? `<meta property="og:image" content="${attr(img)}">` : ""}
<meta property="og:url" content="${attr(pretty)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
${img ? `<meta name="twitter:image" content="${attr(img)}">` : ""}
<link rel="canonical" href="${attr(pretty)}">
<meta http-equiv="refresh" content="0; url=${attr(pretty)}">
</head><body><script>location.replace(${JSON.stringify(pretty)});</script></body></html>`;
}

const items = loadItems();
const outDir = path.join(ROOT, "public", "og", "news");
fs.mkdirSync(outDir, { recursive: true });

for (const it of items) {
  if (!it?.slug) continue;
  const file = path.join(outDir, `${it.slug}.html`);
  fs.writeFileSync(file, htmlFor(it), "utf8");
  console.log("OG page:", path.relative(ROOT, file));
}
console.log(`Done. Generated ${items.length} OG page(s) to /public/og/news/`);
