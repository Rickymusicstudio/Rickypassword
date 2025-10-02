import { useState } from "react";
import { adminApi } from "../../lib/adminApi";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await adminApi.login({ email, password });
      window.location.replace("/admin"); // go to the portal
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <form onSubmit={onSubmit} style={card}>
        <h1 style={title}>Admin Login</h1>

        <label style={label}>Email</label>
        <input
          style={input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <label style={label}>Password</label>
        <input
          style={input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && <div style={errorBox}>{err}</div>}

        <button type="submit" disabled={loading} style={button}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/* styles */
const page = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0b0b" };
const card = { width: 420, maxWidth: "90vw", background: "#111", border: "1px solid #262626", borderRadius: 12, padding: 20, color: "#fff" };
const title = { margin: "0 0 12px", fontSize: 28, fontWeight: 800 };
const label = { display: "block", marginTop: 10, marginBottom: 6, color: "#d1d5db", fontSize: 14 };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #2b2b2b", background: "#0b0b0b", color: "#fff" };
const errorBox = { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "#3b0d0d", border: "1px solid #7f1d1d", color: "#fecaca", fontWeight: 600 };
const button = { marginTop: 16, width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#111", fontWeight: 700, cursor: "pointer" };
 
