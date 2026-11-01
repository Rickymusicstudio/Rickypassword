// src/pages/admin/legacyImport.js — copy the built-in songs/news/gallery (src/data/*.js) into
// Supabase so they can be edited in /admin. Used by the admin "Import" button and by
// tools/import-content.mjs. Safe to re-run: existing rows are updated, not duplicated.
import { songs } from '../../data/songs.js'
import { NEWS } from '../../data/news.js'
import { GALLERY } from '../../data/gallery.js'

// Same-site absolute URLs become site paths so they keep working on any domain/preview.
const local = (u) => (u ? String(u).replace(/^https?:\/\/(www\.)?rickypassword\.com/i, '') : null)
const day = (d) => {
  if (!d) return null
  if (/^\d{4}$/.test(String(d))) return `${d}-01-01`
  const t = new Date(d)
  return Number.isNaN(t.getTime()) ? null : t.toISOString().slice(0, 10)
}

export function legacyRows() {
  const songRows = songs.map((s) => {
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
  })

  const newsRows = NEWS.map((n) => ({
    slug: n.slug,
    title: n.title,
    date: day(n.date) ?? new Date().toISOString().slice(0, 10),
    excerpt: n.excerpt ?? null,
    content: n.content ?? '',
    cover_url: local(n.cover_url),
    images: (n.images_share?.length ? n.images_share : n.images || []).map(local),
    published: true,
  }))

  // gallery.js lists some files twice; import each file once
  const seen = new Set()
  const galleryRows = GALLERY.filter((g) => {
    const k = g.file || g.src
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  }).map((g) => ({
    legacy_file: g.file || g.src,
    image_url: g.src || `/gallery/${g.file}`,
    caption: g.caption || null,
    taken_on: day(g.date),
  }))

  return { songs: songRows, news: newsRows, gallery: galleryRows }
}

/** Upserts everything with the given Supabase client; returns row counts per table. */
export async function importLegacy(db) {
  const rows = legacyRows()
  const conflict = { songs: 'legacy_sku', news: 'slug', gallery: 'legacy_file' }
  const counts = {}
  for (const table of ['songs', 'news', 'gallery']) {
    const { data, error } = await db.from(table).upsert(rows[table], { onConflict: conflict[table] }).select('id')
    if (error) throw new Error(`${table}: ${error.message}`)
    counts[table] = data.length
  }
  return counts
}
