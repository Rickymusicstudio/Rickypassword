// src/lib/engagement.js — likes and comments on songs (plain REST, like ContentContext)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const engagementEnabled = Boolean(SUPABASE_URL && KEY)
// Likes/comments need a real database row; built-in fallback songs have no uuid.
export const canEngage = (track) => engagementEnabled && /^[0-9a-f-]{36}$/i.test(String(track?.sku || ''))

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

async function call(path, opts = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...opts, headers: { ...headers, ...opts.headers } })
  if (!r.ok) {
    const msg = (await r.json().catch(() => null))?.message || `HTTP ${r.status}`
    throw new Error(/row-level security/i.test(msg) ? 'Too many comments right now. Try again in a minute.' : msg)
  }
  return r.status === 204 ? null : r.json()
}

/* ------------------------------ likes ------------------------------ */
const LIKED_KEY = 'rp:liked'
const store = {
  get(k) { try { return localStorage.getItem(k) } catch { return null } },
  set(k, v) { try { localStorage.setItem(k, v) } catch { /* storage blocked */ } },
}

/** Random id for this browser, so one fan = one like per song. */
function visitorId() {
  let id = store.get('rp:visitor')
  if (!id) { id = crypto.randomUUID(); store.set('rp:visitor', id) }
  return id
}

const likedSet = () => new Set(JSON.parse(store.get(LIKED_KEY) || '[]'))
export const hasLiked = (songId) => likedSet().has(songId)

export async function getLikeCount(songId) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/song_likes?song_id=eq.${songId}&select=song_id`, {
    method: 'HEAD', headers: { ...headers, Prefer: 'count=exact' },
  })
  return Number(r.headers.get('content-range')?.split('/')[1] || 0)
}

/** Like or unlike; returns the new total. */
export async function setLike(songId, like) {
  const count = await call('rpc/like_song', {
    method: 'POST', body: JSON.stringify({ p_song: songId, p_visitor: visitorId(), p_like: like }),
  })
  const s = likedSet()
  if (like) s.add(songId); else s.delete(songId)
  store.set(LIKED_KEY, JSON.stringify([...s]))
  return count
}

/* ----------------------------- comments ---------------------------- */
export const listComments = (songId) =>
  call(`song_comments?song_id=eq.${songId}&select=id,name,body,created_at&order=created_at.desc&limit=100`)

export async function postComment(songId, name, body) {
  const rows = await call('song_comments?select=id,name,body,created_at', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ song_id: songId, name: name.trim(), body: body.trim() }),
  })
  store.set('rp:comment-name', name.trim())
  return rows[0]
}

export const savedName = () => store.get('rp:comment-name') || ''
