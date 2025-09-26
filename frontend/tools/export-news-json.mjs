import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { NEWS } from "../src/data/news.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outDir = resolve(__dirname, "..", "public");
mkdirSync(outDir, { recursive: true });

const minimal = NEWS.map(({ slug, title, description, image, url, date }) => ({
  slug, title, description, image, url, date
}));

writeFileSync(
  resolve(outDir, "news.json"),
  JSON.stringify({ ok: true, count: minimal.length, items: minimal }, null, 2)
);

console.log(`[export-news-json] wrote public/news.json (${minimal.length} items)`);
