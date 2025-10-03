import axios from "axios";

// Base URL depends on environment
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"
    : "https://rickypassword.onrender.com";

// Axios instance with baseURL
const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
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

  if (/^https?:\/\//i.test(cand) || cand.startsWith("/")) return cand;

  return `/${cand}`;
};

/** Build a download URL */
const buildDownloadUrl = ({ sku, order_id }) => {
  let url = `/api/download?sku=${encodeURIComponent(sku)}`;
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
      console.warn("GET /api/products failed → []", e?.response?.data || e.message);
      return [];
    }
  },

  async releases() {
    try {
      const { data } = await http.get("/api/releases");
      return Array.isArray(data) ? data : asArray(data);
    } catch (e) {
      console.warn("GET /api/releases failed → []", e?.response?.data || e.message);
      return [];
    }
  },

  async checkoutDev(payload) {
    const { data } = await http.post("/api/checkout/dev", payload);
    return data;
  },

  /** Utilities used by the Music page */
  resolvePreviewUrl,
  buildDownloadUrl,
};
