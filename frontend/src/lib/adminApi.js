const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

// Always include credentials so HttpOnly cookie is sent
const opts = (method = "GET", body, extra = {}) => ({
  method,
  credentials: "include",
  headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...extra.headers },
  body: body ? JSON.stringify(body) : undefined,
  ...extra,
});

async function json(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const adminApi = {
  // Auth
  async login({ email, password }) {
    const res = await fetch(`${BASE}/api/admin/login`, opts("POST", { email, password }));
    return json(res);
  },
  async logout() {
    const res = await fetch(`${BASE}/api/admin/logout`, opts("POST"));
    return json(res);
  },
  // Probe a protected resource to verify cookie session
  async probe() {
    try {
      const res = await fetch(`${BASE}/api/admin/news`, { credentials: "include" });
      return res.ok;
    } catch {
      return false;
    }
  },

  // News
  async listNews() {
    const res = await fetch(`${BASE}/api/admin/news`, { credentials: "include" });
    return json(res);
  },
  async createNews(payload) {
    const res = await fetch(`${BASE}/api/admin/news`, opts("POST", payload));
    return json(res);
  },
  async updateNews(id, payload) {
    const res = await fetch(`${BASE}/api/admin/news/${id}`, opts("PUT", payload));
    return json(res);
  },
  async deleteNews(id) {
    const res = await fetch(`${BASE}/api/admin/news/${id}`, opts("DELETE"));
    return json(res);
  },

  // Releases (add matching admin routes on backend)
  async listReleases() {
    const res = await fetch(`${BASE}/api/releases`, { credentials: "include" });
    return json(res);
  },
  async createRelease(payload) {
    const res = await fetch(`${BASE}/api/admin/releases`, opts("POST", payload));
    return json(res);
  },
  async updateRelease(id, payload) {
    const res = await fetch(`${BASE}/api/admin/releases/${id}`, opts("PUT", payload));
    return json(res);
  },
  async deleteRelease(id) {
    const res = await fetch(`${BASE}/api/admin/releases/${id}`, opts("DELETE"));
    return json(res);
  },

  // Products
  async listProducts() {
    const res = await fetch(`${BASE}/api/products`, { credentials: "include" });
    return json(res);
  },
  async createProduct(payload) {
    const res = await fetch(`${BASE}/api/admin/products`, opts("POST", payload));
    return json(res);
  },
  async updateProduct(id, payload) {
    const res = await fetch(`${BASE}/api/admin/products/${id}`, opts("PUT", payload));
    return json(res);
  },
  async deleteProduct(id) {
    const res = await fetch(`${BASE}/api/admin/products/${id}`, opts("DELETE"));
    return json(res);
  },

  // Upload
  async uploadFile(file, bucket = "covers") {
    const form = new FormData();
    form.append("file", file);
    form.append("bucket", bucket);
    const res = await fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    return json(res);
  },

  // Orders (read-only)
  async listOrders() {
    const res = await fetch(`${BASE}/api/admin/orders`, { credentials: "include" });
    return json(res);
  },
};
 
