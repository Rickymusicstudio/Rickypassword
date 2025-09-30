import { useEffect, useState } from "react";
import { adminApi } from "../../../lib/adminApi";

export default function ProductsTab() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState({ sku: "", title: "", price: 0, kind: "digital", release_id: null });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr("");
    try {
      const data = await adminApi.listProducts();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.sku || !draft.title) return alert("SKU and title are required");
    setBusy(true);
    try {
      await adminApi.createProduct({ ...draft, price: Number(draft.price) || 0 });
      setDraft({ sku: "", title: "", price: 0, kind: "digital", release_id: null });
      await load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div>
      <h3>Create Product</h3>
      <div style={grid4}>
        <Field label="SKU" value={draft.sku} onChange={(v)=>setDraft(d=>({...d,sku:v}))} />
        <Field label="Title" value={draft.title} onChange={(v)=>setDraft(d=>({...d,title:v}))} />
        <Field label="Price (RWF)" value={draft.price} onChange={(v)=>setDraft(d=>({...d,price:v}))} />
        <Field label="Kind" value={draft.kind} onChange={(v)=>setDraft(d=>({...d,kind:v}))} placeholder="digital|physical" />
      </div>
      <Field label="Release ID (optional)" value={draft.release_id ?? ""} onChange={(v)=>setDraft(d=>({...d,release_id:v||null}))} />
      {err && <div style={errBox}>{err}</div>}
      <button style={btn} disabled={busy} onClick={create}>{busy ? "Saving…" : "Save"}</button>

      <h3 style={{ marginTop: 28 }}>Existing</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((p) => (
          <div key={p.id || p.sku} style={row}>
            <div>
              <div style={{ fontWeight: 700 }}>{p.title}</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>{p.sku} — {p.kind} — {p.price} RWF</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={small} onClick={async () => {
                const price = prompt("New price (RWF)", p.price) ?? p.price;
                if (price === null) return;
                await adminApi.updateProduct(p.id, { ...p, price: Number(price) || 0 });
                load();
              }}>Edit</button>
              <button style={smallOutline} onClick={async () => {
                if (!confirm("Delete this product?")) return;
                await adminApi.deleteProduct(p.id);
                load();
              }}>Delete</button>
            </div>
          </div>
        ))}
        {!items.length && <div style={{ opacity: 0.7 }}>No products yet.</div>}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div style={lab}>{label}</div>
      <input style={input} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

const grid4 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 };
const lab = { fontSize: 12, opacity: 0.7, marginTop: 12 };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#0a0a0a", color: "#fff" };
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #222", borderRadius: 10, padding: 12, background: "#0a0a0a" };
const btn = { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "#fff", color: "#000", border: 0, cursor: "pointer", fontWeight: 700 };
const small = { padding: "6px 10px", borderRadius: 8, background: "#fff", color: "#000", border: 0, cursor: "pointer", fontWeight: 600 };
const smallOutline = { ...small, background: "transparent", color: "#fff", border: "1px solid #333" };
const errBox = { marginTop: 10, padding: "8px 10px", background: "#2a0000", border: "1px solid #400", borderRadius: 8, color: "#ff9b9b", fontSize: 13 };
 
