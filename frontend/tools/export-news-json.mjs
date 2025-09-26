// tools/export-news-json.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Adjust if NEWS file lives elsewhere:
import { NEWS } from "../src/data/news.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(__dirname, "../public/news.json");

const slim = NEWS.map(({ slug, title, content, cover_url, images }) => ({
  slug,
  title,
  content,
  cover_url: cover_url || (Array.isArray(images) && images[0]) || ""
}));

await fs.mkdir(path.dirname(outFile), { recursive: true });
await fs.writeFile(outFile, JSON.stringify(slim, null, 2), "utf8");
console.log(`✔ Wrote ${outFile} (${slim.length} posts)`);
