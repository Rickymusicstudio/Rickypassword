// src/pages/admin/adminApi.js — Supabase helpers for the admin (auth, uploads, CRUD)
import { supabase, MEDIA_BUCKET } from '../../lib/supabase'

export const MAX_UPLOAD_MB = 50

export const slugify = (s = '') =>
  s.toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

export const today = () => new Date().toISOString().slice(0, 10)

/* ------------------------------ auth ------------------------------ */
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}
export const signOut = () => supabase.auth.signOut()

export async function isAdmin() {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw error
  return data === true
}

/* ----------------------------- uploads ---------------------------- */
// Photos are resized in the browser (max 1800px, WebP) so pages stay fast.
async function resizeImage(file, max = 1800) {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close?.()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process this image'))), 'image/webp', 0.85)
  )
}

/** Uploads a file to the public media bucket and returns its public URL. */
export async function uploadMedia(file, folder) {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`${file.name} is larger than ${MAX_UPLOAD_MB} MB`)
  }
  const isPhoto = file.type.startsWith('image/') && file.type !== 'image/gif'
  const body = isPhoto ? await resizeImage(file) : file
  const ext = isPhoto ? 'webp' : (file.name.split('.').pop() || 'bin').toLowerCase()
  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'file'
  const path = `${folder}/${Date.now()}-${base}.${ext}`

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType: isPhoto ? 'image/webp' : file.type || undefined,
    cacheControl: '31536000',
  })
  if (error) throw error
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

/** Deletes a file we uploaded (ignores built-in /public files and other hosts). */
export async function removeMedia(url) {
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`
  const i = url?.indexOf(marker) ?? -1
  if (i < 0) return
  await supabase.storage.from(MEDIA_BUCKET).remove([decodeURIComponent(url.slice(i + marker.length))])
}

/* ------------------------------ CRUD ------------------------------ */
export async function list(table, orderBy) {
  let q = supabase.from(table).select('*')
  for (const [col, ascending] of orderBy) q = q.order(col, { ascending, nullsFirst: false })
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function save(table, row) {
  const { id, ...fields } = row
  const q = id
    ? supabase.from(table).update(fields).eq('id', id)
    : supabase.from(table).insert(fields)
  const { data, error } = await q.select().single()
  if (error) throw error
  return data
}

export async function remove(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

/** Turns Supabase/Postgres errors into something readable. */
export function niceError(e) {
  const msg = e?.message || String(e)
  if (e?.code === '23505' || /duplicate key/.test(msg)) return 'That link (slug) is already used by another article.'
  if (/row-level security|permission denied/i.test(msg)) return 'Your account is not allowed to make changes. Is your email in the admins table?'
  if (/Failed to fetch/i.test(msg)) return 'Could not reach the database. Check your internet connection.'
  return msg
}
