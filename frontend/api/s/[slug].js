// api/s/[slug].js
export default async function handler(req, res) {
  try {
    const ITEMS = await loadItems(req);

    // Debug: /api/s/anything?debug=1
    if (req.query?.debug === "1") {
      return res
        .status(200)
        .json({ ok: true, count: ITEMS.length, slugs: ITEMS.map(x => x.slug) });
    }

    const { slug } = req.query || {};
    if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

    const item = ITEMS.find(n => n.slug === slug);
    if (!item) return res.status(404).json({ ok: false, error: "Not found" });

    const title = item.title || "Ricky Password";
    const description = item.excerpt || "News";
    const image = abs(item.cover_url || (Array.isArray(item.images) && item.images[0]) || "");
    const prettyUrl = `https://rickypassword.com/news/${encodeURIComponent(slug)}`;

    const accept = String(req.headers["accept"] || "").toLowerCase();
    if (accept.includes("application/json")) {
      return res.status(200).json({ ok: true, item, prettyUrl, image });
    }

    const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${esc(description)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Ricky Password" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
${image ? `<meta property="og:image" content="${attr(image)}" />` : ""}
<meta property="og:url" content="${attr(prettyUrl)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
${image ? `<meta name="twitter:image" content="${attr(image)}" />` : ""}
<link rel="canonical" href="${attr(prettyUrl)}" />
<meta http-equiv="refresh" content="0; url=${attr(prettyUrl)}" />
</head><body><script>location.replace(${JSON.stringify(prettyUrl)});</script></body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

async function loadItems(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "rickypassword.com";
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const url = `${proto}://${host}/news.json`;

  try {
    const r = await fetch(url, { cache: "no-store" });
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data)) return data;
    }
  } catch {}
  try {
    const mod = await import("../../src/data/news.js");
    const arr = mod?.NEWS ?? mod?.default;
    if (Array.isArray(arr)) return arr;
  } catch {}
  return [];
}

function esc(s=""){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
function attr(s=""){return String(s).replaceAll('"',"&quot;")}
function abs(u=""){ if(!u) return ""; if(/^https?:\/\//i.test(u)) return u; if(u.startsWith("/")) return `https://rickypassword.com${u}`; return `https://rickypassword.com/${u}`; }
