// api/og/news/[slug].js
import { NEWS } from "../../../src/data/news.js";

export default function handler(req, res) {
  try {
    const { slug } = req.query || {};
    if (!slug) return res.status(400).json({ ok:false, error:"Missing slug" });

    const item = (Array.isArray(NEWS)?NEWS:[]).find(n => n.slug === slug);
    if (!item) return res.status(404).json({ ok:false, error:"Not found" });

    const title = item.title || "Ricky Password";
    const description = item.excerpt || "News";
    const image = toAbs(item.cover_url);
    const prettyUrl = `https://rickypassword.com/news/${encodeURIComponent(slug)}`;

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");

    const accept = String(req.headers["accept"] || "").toLowerCase();
    if (accept.includes("application/json")) {
      return res.status(200).json({ ok:true, item });
    }

    const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>${escHtml(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${escHtml(description)}" />
<meta property="og:type" content="article" />
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
    res.status(200).send(html);
  } catch (e) {
    res.status(500).json({ ok:false, error: e?.message || "Server error" });
  }
}

function escHtml(s=""){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
function escAttr(s=""){return String(s).replaceAll('"',"&quot;")}
function toAbs(u=""){ if(!u) return "";
  if(/^https?:\/\//i.test(u)) return u;
  if(u.startsWith("/")) return `https://rickypassword.com${u}`;
  return `https://rickypassword.com/${u}`;
}
