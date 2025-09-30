import { useEffect, useState } from "react";
import { adminApi } from "../../../lib/adminApi";

export default function ReleasesTab() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState({ title: "", cover_url: "", date: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr("");
    try {
      const data = await adminApi.listReleases();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!draft.title) return alert("Title is required");
    setBusy(true);
    try {
      await adminApi.createRelease(draft);
      setDraft({ title: "", cover_url: "", date: "" });
      await load();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div>
      <h3>Create Release</h3>
      <div style={grid3}>
        <Field label="Title" value={draft.title} onChange={(v)=>setDraft(d=>({...d,title:v}))} />
        <Field label="Cover URL" value={draft.cover_url} onChange={(v)=>setDraft(d=>({...d,cover_url:v}))} />
        <Field label="Date (YYYY-MM-DD)" value={draft.date} onChange={(v)=>setDraft(d=>({...d,date:v}))} />
      </div>
      {err && <div style={errBox}>{err}</div>}
      <button style={btn} disabled={busy} onClick={create}>{busy ? "Saving…" : "Save"}</button>

      <h3 style={{ marginTop: 28 }}>Existing</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((r) => (
          <div key={r.id} style={row}>
            <div>
              <div style={{ fontWeight: 700 }}>{r.title}</div>
              {r.date && <div style={{ opacity: 0.7, fontSize: 12 }}>{r.date}</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={small} onClick={async () => {
                const title = prompt("Edit title", r.title ?? "") ?? r.title;
                if (title === null) return;
                await adminApi.updateRelease(r.id, { ...r, title });
                load();
              }}>Edit</button>
              <button style={smallOutline} onClick={async () => {
                if (!confirm("Delete this release?")) return;
                await adminApi.deleteRelease(r.id);
                load();
              }}>Delete</button>
            </div>
          </div>
        ))}
        {!items.length && <div style={{ opacity: 0.7 }}>No releases yet.</div>}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <div style={lab}>{label}</div>
      <input style={input} value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  );
}

const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };
const lab = { fontSize: 12, opacity: 0.7, marginTop: 12 };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#0a0a0a", color: "#fff" };
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #222", borderRadius: 10, padding: 12, background: "#0a0a0a" };
const btn = { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "#fff", color: "#000", border: 0, cursor: "pointer", fontWeight: 700 };
const small = { padding: "6px 10px", borderRadius: 8, background: "#fff", color: "#000", border: 0, cursor: "pointer", fontWeight: 600 };
const smallOutline = { ...small, background: "transparent", color: "#fff", border: "1px solid #333" };
const errBox = { marginTop: 10, padding: "8px 10px", background: "#2a0000", border: "1px solid #400", borderRadius: 8, color: "#ff9b9b", fontSize: 13 };


