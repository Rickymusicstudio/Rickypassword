// src/data/tracks.js — normalized, sorted, published tracks built from songs.js
import * as songsModule from './songs'

// pull songs no matter how it's exported
function getSongsArray(mod) {
  if (Array.isArray(mod.default)) return mod.default
  if (Array.isArray(mod.SONGS)) return mod.SONGS
  if (Array.isArray(mod.songs)) return mod.songs
  return []
}

const isHttpUrl = (u = '') => /^https?:\/\//i.test(u)

/** Encode local public paths (they can contain spaces); leave absolute URLs alone. */
export const mediaUrl = (u = '') => {
  if (!u) return ''
  if (isHttpUrl(u)) return u
  return encodeURI(u.startsWith('/') ? u : `/${u}`)
}

export const toFileName = (t = 'track') => `${t.replace(/[^\w-]+/g, '_')}.mp3`

export const TRACKS = getSongsArray(songsModule)
  .map((x) => {
    const ytOnly = x.youtube_only === true || x.listen === 'youtube'
    return {
      sku: x.sku ?? x.id ?? x.title,
      title: x.title ?? '',
      cover_url: x.cover_url ?? x.cover ?? '/covers/star_cover.jpg',
      released_at: x.released_at ?? x.release_date ?? null,
      media_path: x.media_path ?? x.audio ?? '',
      preview_url: x.preview_url ?? x.audio ?? x.media_path ?? '',
      youtube_url: x.youtube_url ?? x.youtube ?? '',
      ytOnly,
      hidden: x.hidden === true || x.is_published === false,
      can_download: x.can_download !== false && !ytOnly,
    }
  })
  .filter((t) => !t.hidden)
  .sort((a, b) => new Date(b.released_at || 0) - new Date(a.released_at || 0))

export const releaseYear = (t) => (t?.released_at ? new Date(t.released_at).getFullYear() : '')
