// src/lib/api.js
import axios from "axios";

const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1");

export const API_BASE =
  (import.meta.env.VITE_API_URL &&
    import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
  (isLocal ? "http://localhost:4000" : "https://rickypassword.onrender.com");

// eslint-disable-next-line no-console
console.log("[api] BASE =", API_BASE);

const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
});

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const resolvePreviewUrl = (item) => {
  const cand =
    item?.preview_url ||
    item?.media_path ||
    item?.product?.preview_url ||
    item?.product?.media_path;
  if (!cand) return "";
  if (/^https?:\/\//i.test(cand)) return cand;
  const path = cand.startsWith("/") ? cand.slice(1) : cand;
  return `${API_BASE}/${path}`;
};

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
  resolvePreviewUrl,
  buildDownloadUrl,
};
