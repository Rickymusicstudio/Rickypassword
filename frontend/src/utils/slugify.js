// src/utils/slugify.js
export function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFKD")                 // split accents
    .replace(/[\u0300-\u036f]/g, "")   // drop accents
    .replace(/[^a-z0-9]+/g, "-")       // non-alnum -> hyphen
    .replace(/^-+|-+$/g, "")           // trim hyphens
    .slice(0, 80);                     // max length
}
 
