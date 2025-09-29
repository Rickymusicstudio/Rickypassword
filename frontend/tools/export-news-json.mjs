// tools/export-news-json.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { NEWS } from "../src/data/news.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outDir = resolve(__dirname, "..", "public");
mkdirSync(outDir, { recursive: true });

const items = (Array.isArray(NEWS) ? NEWS : []).map(
  ({ slug, title, excerpt, cover_url, images = [], date }) => ({
    slug, title, excerpt, cover_url, images, date
  })
);

writeFileSync(resolve(outDir, "news.json"), JSON.stringify({ items }, null, 2));
console.log(`[export-news-json] wrote ${items.length} items to public/news.json`);
