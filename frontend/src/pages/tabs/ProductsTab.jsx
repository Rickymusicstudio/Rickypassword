import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi.js";


export default function ProductsTab() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try {
      const data = await adminApi.listProducts();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setMsg("Could not load products.");
      }
    }
  }
  useEffect(()=>{ load(); }, []);

  return (
    <div style={card}>
      <h3 style={{ margin:0, marginBottom:12 }}>Products</h3>
      {msg && <div style={note}>{msg}</div>}
      {!items.length ? <div style={{ color:"#64748b" }}>No products yet.</div> : (
        <ul style={{ margin:0, paddingLeft:18 }}>
          {items.map(p => <li key={p.id || p.slug}>{p.title || p.name}</li>)}
        </ul>
      )}
    </div>
  );
}
const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 };
const note = { padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:8, background:"#f8fafc", color:"#111827", width:"fit-content" };
 
