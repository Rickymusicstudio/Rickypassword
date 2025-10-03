// src/lib/api.js
import axios from "axios";

// figure out where the backend lives
const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1");

// Prefer env; fall back to localhost in dev, Render in prod
const API_BASE =
  (import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  (isLocal ? "http://localhost:4000" : "https://rickypassword.onrender.com");

// one axios instance for everything
const http = axios.create({
  baseURL: API_BASE,     // <-- critical
  timeout: 10000,
  withCredentials: true, // ok even if not used; CORS must allow credentials
});

/** Small helper: ensure an array back to callers */
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

/** Resolve a playable preview URL from a release/product object */
const resolvePreviewUrl = (item) => {
  const cand =
    item?.preview_url ||
    item?.media_path ||
    item?.product?.preview_url ||
    item?.product?.media_path;

  if (!cand) return "";

  // Absolute http(s) or already rooted to some host
  if (/^https?:\/\//i.test(cand)) return cand;

  // If it begins with "/", root it at our API host; else treat as relative path on API host
  const path = cand.startsWith("/") ? cand.slice(1) : cand;
  return `${API_BASE}/${path}`;
};

/** Build a download URL on the API host */
const buildDownloadUrl = ({ sku, order_id }) => {
  let url = `${API_BASE}/api/download?sku=${encodeURIComponent(sku)}`;
  if (order_id) url += `&order_id=${encodeURIComponent(order_id)}`;
  return url;
};

export const api = {
  async health() {
    const { data } = await http.get("/api/health");
    return data;
  },

  async products() {
    try {
      const { data } = await http.get("/api/products");
      return Array.isArray(data) ? data : asArray(data);
    } catch (e) {
      console.warn(
        "GET /api/products failed → []",
        e?.response?.data || e.message
      );
      return [];
    }
  },

  async releases() {
    try {
      const { data } = await http.get("/api/releases");
      return Array.isArray(data) ? data : asArray(data);
    } catch (e) {
      console.warn(
        "GET /api/releases failed → []",
        e?.response?.data || e.message
      );
      return [];
    }
  },

  async checkoutDev(payload) {
    // expected dev response: { order_id, download_url? , ... }
    const { data } = await http.post("/api/checkout/dev", payload);
    return data;
  },

  /** Utilities used by the Music page */
  resolvePreviewUrl,
  buildDownloadUrl,
};
