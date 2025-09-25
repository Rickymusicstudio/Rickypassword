// src/lib/api.js
import axios from 'axios'

// Vite dev proxy forwards /api -> http://localhost:4000
const http = axios.create({ timeout: 10000 })

/** Small helper: ensure an array back to callers */
const asArray = (v) => (Array.isArray(v) ? v : (v ? [v] : []))

/** Resolve a playable preview URL from a release/product object */
const resolvePreviewUrl = (item) => {
  // Prefer explicit preview fields; fall back to media_path (e.g. "releases/shumaka-track.mp3")
  const cand =
    item?.preview_url ||
    item?.media_path ||
    item?.product?.preview_url ||
    item?.product?.media_path

  if (!cand) return ''

  // Absolute http(s) or already rooted
  if (/^https?:\/\//i.test(cand) || cand.startsWith('/')) return cand

  // Treat as relative path (e.g., "releases/abc.mp3")
  return `/${cand}`
}

/** Build a download URL. If your backend returns download_url from checkout, use that instead. */
const buildDownloadUrl = ({ sku, order_id }) => {
  // Adjust this to your real route if different.
  // Works with a common pattern: /api/download?sku=...&order_id=...
  let url = `/api/download?sku=${encodeURIComponent(sku)}`
  if (order_id) url += `&order_id=${encodeURIComponent(order_id)}`
  return url
}

export const api = {
  async health() {
    const { data } = await http.get('/api/health')
    return data
  },

  async products() {
    try {
      const { data } = await http.get('/api/products')
      return Array.isArray(data) ? data : asArray(data)
    } catch (e) {
      console.warn('GET /api/products failed → []', e?.response?.data || e.message)
      return []
    }
  },

  async releases() {
    try {
      const { data } = await http.get('/api/releases')
      return Array.isArray(data) ? data : asArray(data)
    } catch (e) {
      console.warn('GET /api/releases failed → []', e?.response?.data || e.message)
      return []
    }
  },

  async checkoutDev(payload) {
    // expected dev response: { order_id, download_url? , ... }
    const { data } = await http.post('/api/checkout/dev', payload)
    return data
  },

  /** Utilities used by the Music page */
  resolvePreviewUrl,
  buildDownloadUrl,
}
