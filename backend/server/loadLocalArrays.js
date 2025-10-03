// ESM-only helper to import arrays from your frontend data files.
import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs/promises";

/**
 * Finds an exported array from a module:
 * - default export if it's an array
 * - named export by guess (e.g. SONGS / NEWS / GALLERY)
 * - otherwise the first exported array it can find
 */
async function importArray(fullPath, guessName) {
  const fileUrl = pathToFileURL(fullPath).href;

  // If the file is a .json, read it; if .js, import it
  if (fullPath.endsWith(".json")) {
    const raw = await fs.readFile(fullPath, "utf8");
    const json = JSON.parse(raw);
    return Array.isArray(json) ? json : [];
  }

  const mod = await import(fileUrl);
  const arr =
    (Array.isArray(mod.default) && mod.default) ||
    (Array.isArray(mod[guessName]) && mod[guessName]) ||
    Object.values(mod).find((v) => Array.isArray(v));
  return Array.isArray(arr) ? arr : [];
}

// Resolve project root (where server.js lives)
const ROOT = process.env.DATA_ROOT || process.cwd();

// Allow overriding data folder in env (for prod), else default to your repo layout
const DATA_DIR = process.env.DATA_DIR || "frontend/src/data";

const p = (...bits) => path.join(ROOT, DATA_DIR, ...bits);

export async function loadSongs()   { return importArray(p("songs.js"),   "SONGS"); }
export async function loadNews()    { return importArray(p("news.js"),    "NEWS"); }
export async function loadGallery() { return importArray(p("gallery.js"), "GALLERY"); }
