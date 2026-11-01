// tools/optimize-images.mjs — generate lightweight WebP versions of site images.
// Originals stay untouched (news/OG pages link to them); the site loads "<name>-sm.webp"
// via <Img> and falls back to the original if a WebP is missing.
// Run after adding new covers/photos:  npm run images
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IMG = /\.(jpe?g|png)$/i

const jobs = [
  { dir: 'public/covers', width: 640, quality: 78 },
  { dir: 'public/gallery', width: 1000, quality: 76 },
]

async function exists(p) {
  try { return (await stat(p)).mtimeMs } catch { return 0 }
}

let made = 0, saved = 0
for (const { dir, width, quality } of jobs) {
  const abs = path.join(root, dir)
  for (const name of await readdir(abs)) {
    if (!IMG.test(name)) continue
    const src = path.join(abs, name)
    const out = path.join(abs, name.replace(IMG, '-sm.webp'))
    const srcTime = await exists(src)
    if ((await exists(out)) >= srcTime) continue
    const info = await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(out)
    made++; saved += (await stat(src)).size - info.size
  }
}

// Hero background (imported by src/components/Hero.jsx)
const heroSrc = path.join(root, 'src/assets/hero_image2.png')
const heroOut = path.join(root, 'src/assets/hero.webp')
if ((await exists(heroOut)) < (await exists(heroSrc))) {
  await sharp(heroSrc).resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 72 }).toFile(heroOut)
  made++
}

console.log(`optimize-images: ${made} file(s) written, ~${(saved / 1048576).toFixed(1)} MB smaller than originals`)
