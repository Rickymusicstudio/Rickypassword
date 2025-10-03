import path from "node:path";
import fs from "node:fs/promises";

const ROOT = process.env.DATA_ROOT || process.cwd();
const DATA_DIR = process.env.DATA_DIR || "frontend/src/data";
const p = (...bits) => path.join(ROOT, DATA_DIR, ...bits);

async function writeArrayJson(filename, arr) {
  const full = p(filename);
  const json = JSON.stringify(arr, null, 2) + "\n";
  await fs.writeFile(full, json, "utf8");
  return true;
}

export async function readJsonOrJs(loaderFn, jsonName) {
  // Prefer JSON if exists
  try {
    const full = p(jsonName);
    const raw = await fs.readFile(full, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // fallback to JS loader
    return loaderFn();
  }
}

export async function saveSongs(arr)   { return writeArrayJson("songs.json",   arr); }
export async function saveNews(arr)    { return writeArrayJson("news.json",    arr); }
export async function saveGallery(arr) { return writeArrayJson("gallery.json", arr); }
 
