import { useState } from "react";
import { adminApi } from "../../lib/adminApi";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await adminApi.login({ email, password });
      // cookie set by server; redirect to /admin
      window.location.replace("/admin");
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={wrap}>
      <form onSubmit={onSubmit} style={card}>
        <h2 style={{ marginTop: 0 }}>Admin Login</h2>
        <label style={label}>Email</label>
        <input style={input} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@domain.com" />
        <label style={label}>Password</label>
        <input style={input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        {err && <div style={errBox}>{err}</div>}
        <button style={btn} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}

const wrap = { minHeight: "60vh", display: "grid", placeItems: "center", padding: 24 };
const card = { width: 360, maxWidth: "92vw", background: "#111", border: "1px solid #222", borderRadius: 12, padding: 20, color: "#fff" };
const label = { fontSize: 12, opacity: 0.7, marginTop: 12, display: "block" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#0a0a0a", color: "#fff" };
const btn = { marginTop: 16, width: "100%", padding: "10px 12px", borderRadius: 8, background: "#fff", color: "#000", border: "0", cursor: "pointer", fontWeight: 600 };
const errBox = { marginTop: 10, padding: "8px 10px", background: "#2a0000", border: "1px solid #400", borderRadius: 8, color: "#ff9b9b", fontSize: 13 };
