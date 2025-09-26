// tools/export-news-json.mjs
// Generate a slim public/news.json for OG previews

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 1) Import your NEWS source (adjust path if yours differs)
import { NEWS } from "../src/data/news.js";

// 2) Resolve output path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "../public/news.json");

// 3) Site origin for producing absolute image URLs
//    (Vercel sets VERCEL_URL in builds; fallback to your domain)
const SITE_ORIGIN = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://rickypassword.com";

// 4) Helpers
const isAbs = (u) => typeof u === "string" && /^https?:\/\//i.test(u);

// Prefer cover_url; else images[0]; ensure absolute URL
function resolveImage({ cover_url, images }) {
  const src = cover_url || (Array.isArray(images) && images[0]) || "";
  if (!src) return ""; // let the serverless function provide a final fallback
  return isAbs(src) ? src : `${SITE_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;
}

// 5) Build a slim array with only what the OG page needs
const slim = NEWS.map(({ slug, title, content, cover_url, images }) => {
  // Keep content lightweight; OG description will be a short summary anyway
  const safeContent =
    typeof content === "string" ? content.trim() : "";

  return {
    slug,
    title,
    content: safeContent,
    cover_url: resolveImage({ cover_url, images })
  };
}).filter(Boolean);

// 6) Write file
await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
await fs.writeFile(OUT_FILE, JSON.stringify(slim, null, 2), "utf8");

console.log(`✔ Wrote ${OUT_FILE} (${slim.length} posts) using origin ${SITE_ORIGIN}`);
