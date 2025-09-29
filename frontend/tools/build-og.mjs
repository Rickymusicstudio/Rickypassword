// tools/build-og.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = "https://rickypassword.com";

const toAbs = (u = "") =>
  !u ? "" : /^https?:\/\//i.test(u) ? u : u.startsWith("/") ? SITE + u : SITE + "/" + u;

function htmlFor(item) {
  const slug = item.slug;
  const title = item.title || "Ricky Password";
  const desc  = item.excerpt || "News";
  const image = toAbs(item.cover_url || (Array.isArray(item.images) && item.images[0]) || "");
  const pretty = `${SITE}/news/${encodeURIComponent(slug)}`;

  const esc = s => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  const attr = s => String(s).replaceAll('"',"&quot;");

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${esc(desc)}" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="Ricky Password" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
${image ? `<meta property="og:image" content="${attr(image)}" />` : ""}
<meta property="og:url" content="${attr(pretty)}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
${image ? `<meta name="twitter:image" content="${attr(image)}" />` : ""}

<link rel="canonical" href="${attr(pretty)}" />
<meta http-equiv="refresh" content="0; url=${attr(pretty)}" />
</head><body>
<script>location.replace(${JSON.stringify(pretty)});</script>
</body></html>`;
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function loadItems() {
  // Prefer the JSON in public/
  const jsonPath = path.join(ROOT, "public", "news.json");
  if (fs.existsSync(jsonPath)) {
    const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
    return items;
  }
  // Fallback to the source list
  try {
    const { NEWS } = require(path.join(ROOT, "src", "data", "news.js"));
    return Array.isArray(NEWS) ? NEWS : [];
  } catch { return []; }
}

const items = loadItems();
const outDir = path.join(ROOT, "public", "og", "news");
ensureDir(outDir);

for (const it of items) {
  if (!it?.slug) continue;
  const file = path.join(outDir, `${it.slug}.html`);
  fs.writeFileSync(file, htmlFor(it), "utf8");
  console.log("OG page:", path.relative(ROOT, file));
}

console.log(`Done. ${items.length} page(s) generated to /public/og/news/*.html`);
 
