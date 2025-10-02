import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi.js";


export default function ReleasesTab() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try {
      // try admin endpoint first
      const data = await adminApi.listReleases();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      // fallback to public list if admin route not implemented yet
      try {
        const res = await fetch("/api/releases");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setMsg("Could not load releases.");
      }
    }
  }
  useEffect(()=>{ load(); }, []);

  return (
    <div style={card}>
      <h3 style={{ margin:0, marginBottom:12 }}>Releases</h3>
      {msg && <div style={note}>{msg}</div>}
      {!items.length ? <div style={{ color:"#64748b" }}>No releases yet.</div> : (
        <ul style={{ margin:0, paddingLeft:18 }}>
          {items.map(r => <li key={r.id || r.slug}>{r.title || r.name}</li>)}
        </ul>
      )}
    </div>
  );
}
const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 };
const note = { padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:8, background:"#f8fafc", color:"#111827", width:"fit-content" };
 
