// tools/import-content.mjs — one-time copy of the built-in songs/news/gallery (src/data/*.js)
// into Supabase so they can be edited in /admin. Safe to re-run: existing rows are updated, not duplicated.
//
//   cd frontend
//   node --env-file=.env.local tools/import-content.mjs
//
// Needs SUPABASE_SERVICE_ROLE_KEY (Supabase → Project Settings → API → service_role) next to
// VITE_SUPABASE_URL in .env.local. Never commit that key or put it in a VITE_ variable.
import { createClient } from '@supabase/supabase-js'
import { songs } from '../src/data/songs.js'
import { NEWS } from '../src/data/news.js'
import { GALLERY } from '../src/data/gallery.js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see ADMIN_SETUP.md).')
  process.exit(1)
}
const db = createClient(url, key, { auth: { persistSession: false } })

// Same-site absolute URLs become site paths so they keep working on any domain/preview.
const local = (u) => (u ? String(u).replace(/^https?:\/\/(www\.)?rickypassword\.com/i, '') : null)
const day = (d) => {
  if (!d) return null
  if (/^\d{4}$/.test(String(d))) return `${d}-01-01`
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? null : t.toISOString().slice(0, 10)
}

async function upsert(table, rows, onConflict) {
  const { error, data } = await db.from(table).upsert(rows, { onConflict }).select('id')
  if (error) throw new Error(`${table}: ${error.message}`)
  console.log(`${table}: ${data.length} row(s) imported`)
}

await upsert('songs', songs.map((s) => {
  const ytOnly = s.youtube_only === true || s.listen === 'youtube'
  const audio = s.media_path ?? s.audio ?? s.preview_url ?? null
  return {
    legacy_sku: s.sku ?? s.id ?? s.title,
    title: s.title,
    released_at: day(s.released_at ?? s.release_date),
    cover_url: local(s.cover_url ?? s.cover),
    audio_url: ytOnly ? null : local(audio),
    youtube_url: s.youtube_url ?? s.youtube ?? null,
    youtube_only: ytOnly,
    can_download: s.can_download !== false && !ytOnly,
    published: !(s.hidden === true || s.is_published === false),
  }
}), 'legacy_sku')

await upsert('news', NEWS.map((n) => ({
  slug: n.slug,
  title: n.title,
  date: day(n.date) ?? new Date().toISOString().slice(0, 10),
  excerpt: n.excerpt ?? null,
  content: n.content ?? '',
  cover_url: local(n.cover_url),
  images: (n.images_share?.length ? n.images_share : n.images || []).map(local),
  published: true,
})), 'slug')

// gallery.js lists some files twice; import each file once
const seen = new Set()
await upsert('gallery', GALLERY.filter((g) => {
  const k = g.file || g.src
  if (!k || seen.has(k)) return false
  seen.add(k)
  return true
}).map((g) => ({
  legacy_file: g.file || g.src,
  image_url: g.src || `/gallery/${g.file}`,
  caption: g.caption || null,
  taken_on: day(g.date),
})), 'legacy_file')

console.log('Done. Open /admin to edit everything.')
