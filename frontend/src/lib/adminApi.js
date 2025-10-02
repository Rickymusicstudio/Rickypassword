// frontend/src/lib/adminApi.js

// Prefer env, but if it's missing during dev (port 5173), fall back to 4000.
const FALLBACK_DEV =
  typeof window !== "undefined" && window.location.port === "5173"
    ? "http://localhost:4000"
    : "";

const BASE =
  (import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  FALLBACK_DEV;

// Keep the log for sanity checks while wiring things up
// (comment out later if you want)
// eslint-disable-next-line no-console
console.log("[adminApi] BASE =", BASE);

// Add optional dev header if you want to bypass auth locally (match server)
const DEV_HEADERS =
  import.meta.env.DEV && import.meta.env.VITE_ADMIN_DEV_KEY
    ? { "x-admin-key": import.meta.env.VITE_ADMIN_DEV_KEY }
    : {};

// Always include credentials so HttpOnly cookie is sent
const opts = (method = "GET", body, extra = {}) => ({
  method,
  credentials: "include",
  headers: {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...DEV_HEADERS,
    ...extra.headers,
  },
  body: body ? JSON.stringify(body) : undefined,
  ...extra,
});

async function toJson(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

export const adminApi = {
  /** Expose BASE if you need it elsewhere */
  base() {
    return BASE;
  },

  /* ----------------------------- Auth ----------------------------- */
  login({ email, password }) {
    return fetch(`${BASE}/api/admin/login`, opts("POST", { email, password })).then(toJson);
  },

  logout() {
    return fetch(`${BASE}/api/admin/logout`, opts("POST")).then(toJson);
  },

  /** Quick ping to check if cookie/session is valid */
  async probe() {
    try {
      const res = await fetch(`${BASE}/api/admin/ping`, { credentials: "include" });
      return res.ok;
    } catch {
      return false;
    }
  },

  /* ----------------------------- Public Lists ---------------------- */
  // These read from frontend/src/data via the backend content routes
  listPublicReleases() {
    return fetch(`${BASE}/api/releases`, { credentials: "include" }).then(toJson);
  },
  listPublicNews() {
    return fetch(`${BASE}/api/news`, { credentials: "include" }).then(toJson);
  },
  listPublicGallery() {
    return fetch(`${BASE}/api/gallery`, { credentials: "include" }).then(toJson);
  },

  /* ----------------------------- News (Admin) ---------------------- */
  listNews() {
    return fetch(`${BASE}/api/admin/news`, { credentials: "include" }).then(toJson);
  },
  createNews(payload) {
    return fetch(`${BASE}/api/admin/news`, opts("POST", payload)).then(toJson);
  },
  updateNews(id, payload) {
    return fetch(`${BASE}/api/admin/news/${id}`, opts("PUT", payload)).then(toJson);
  },
  deleteNews(id) {
    return fetch(`${BASE}/api/admin/news/${id}`, opts("DELETE")).then(toJson);
  },

  /* --------------------------- Songs/Releases (Admin) -------------- */
  // Our CRUD routes are /api/admin/songs (backed by songs.json or songs.js)
  listSongs() {
    return fetch(`${BASE}/api/admin/content`, { credentials: "include" })
      .then(toJson)
      .then((x) => x?.songs || []);
  },
  createSong(payload) {
    return fetch(`${BASE}/api/admin/songs`, opts("POST", payload)).then(toJson);
  },
  updateSong(id, payload) {
    return fetch(`${BASE}/api/admin/songs/${id}`, opts("PUT", payload)).then(toJson);
  },
  deleteSong(id) {
    return fetch(`${BASE}/api/admin/songs/${id}`, opts("DELETE")).then(toJson);
  },

  /* --------------------------- Gallery (Admin) --------------------- */
  listGallery() {
    return fetch(`${BASE}/api/admin/content`, { credentials: "include" })
      .then(toJson)
      .then((x) => x?.gallery || []);
  },
  createGalleryItem(payload) {
    return fetch(`${BASE}/api/admin/gallery`, opts("POST", payload)).then(toJson);
  },
  updateGalleryItem(id, payload) {
    return fetch(`${BASE}/api/admin/gallery/${id}`, opts("PUT", payload)).then(toJson);
  },
  deleteGalleryItem(id) {
    return fetch(`${BASE}/api/admin/gallery/${id}`, opts("DELETE")).then(toJson);
  },

  /* --------------------------- Products ---------------------------- */
  listProducts() {
    return fetch(`${BASE}/api/products`, { credentials: "include" }).then(toJson);
  },
  createProduct(payload) {
    return fetch(`${BASE}/api/admin/products`, opts("POST", payload)).then(toJson);
  },
  updateProduct(id, payload) {
    return fetch(`${BASE}/api/admin/products/${id}`, opts("PUT", payload)).then(toJson);
  },
  deleteProduct(id) {
    return fetch(`${BASE}/api/admin/products/${id}`, opts("DELETE")).then(toJson);
  },

  /* ---------------------------- Uploads ---------------------------- */
  uploadFile(file, bucket = "covers") {
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", bucket);
    return fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
      headers: DEV_HEADERS, // carry dev header if used
    }).then(toJson);
  },

  /* ----------------------------- Orders ---------------------------- */
  listOrders() {
    return fetch(`${BASE}/api/admin/orders`, { credentials: "include" }).then(toJson);
  },

  /* ----------------------- Article Views Tracking ------------------ */
  trackView(slug) {
    return fetch(`${BASE}/api/track/article-view`, opts("POST", { slug })).then(toJson);
  },
  getViewsSummary(days = 30) {
    return fetch(`${BASE}/api/admin/views/summary?days=${encodeURIComponent(days)}`, {
      credentials: "include",
      headers: DEV_HEADERS,
    }).then(toJson);
  },

  /* ---------------------------- Dashboard -------------------------- */
  /**
   * Get site-wide stats for the Dashboard.
   * Tries /api/admin/stats first; if missing, derives from public endpoints.
   */
  async siteStats() {
    // Preferred: aggregated stats from backend
    try {
      const r = await fetch(`${BASE}/api/admin/stats`, { credentials: "include" });
      if (r.ok) return await r.json();
    } catch {}

    // Fallbacks — best-effort counts from public endpoints
    const stats = {
      songs: 0,
      pictures: 0,
      articles: 0,
      articleViews: 0,
      viewsSeries: [],
    };

    try {
      const r = await fetch(`${BASE}/api/releases`);
      if (r.ok) stats.songs = (await r.json())?.length ?? 0;
    } catch {}

    try {
      const r = await fetch(`${BASE}/api/news`);
      if (r.ok) stats.articles = (await r.json())?.length ?? 0;
    } catch {}

    try {
      const r = await fetch(`${BASE}/api/gallery`);
      if (r.ok) stats.pictures = (await r.json())?.length ?? 0;
    } catch {}

    // Try to pull a views series if the summary endpoint exists
    try {
      const r = await fetch(`${BASE}/api/admin/views/summary?days=30`, { credentials: "include" });
      if (r.ok) {
        const s = await r.json();
        stats.viewsSeries = s?.series || [];
        stats.articleViews = s?.series?.reduce((a, b) => a + (b.views || 0), 0) || 0;
      }
    } catch {}

    return stats;
  },
};
