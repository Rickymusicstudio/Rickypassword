// src/data/tracks.js — track normalization shared by the built-in songs.js and the database
import * as songsModule from './songs'
import { slugify } from '../lib/site'

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

/** Accepts both songs.js entries and `songs` table rows. */
export function normalizeTrack(x) {
  const ytOnly = x.youtube_only === true || x.listen === 'youtube'
  const audio = x.audio_url ?? x.media_path ?? x.audio ?? ''
  return {
    sku: x.id ?? x.sku ?? x.title,
    title: x.title ?? '',
    slug: slugify(x.title ?? ''),
    cover_url: x.cover_url ?? x.cover ?? '/covers/star_cover.jpg',
    released_at: x.released_at ?? x.release_date ?? null,
    media_path: audio,
    preview_url: x.preview_url ?? audio,
    youtube_url: x.youtube_url ?? x.youtube ?? '',
    ytOnly,
    hidden: x.hidden === true || x.is_published === false || x.published === false,
    can_download: x.can_download !== false && !ytOnly && !!audio,
  }
}

export const sortTracks = (list) =>
  list
    .map(normalizeTrack)
    .filter((t) => !t.hidden)
    .sort((a, b) => new Date(b.released_at || 0) - new Date(a.released_at || 0))

export const STATIC_TRACKS = sortTracks(getSongsArray(songsModule))

export const releaseYear = (t) => (t?.released_at ? new Date(t.released_at).getFullYear() : '')
