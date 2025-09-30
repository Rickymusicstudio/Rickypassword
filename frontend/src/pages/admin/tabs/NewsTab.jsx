// src/pages/admin/tabs/NewsTab.jsx
import { useEffect, useState } from "react";
import { adminApi } from "../../../lib/adminApi";
import { slugify } from "../../../utils/slugify";

export default function NewsTab() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState({ title: "", slug: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null); // {type:'ok'|'err', msg:string}

  const notify = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2200);
  };

  const load = async () => {
    try {
      const data = await adminApi.listNews();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      notify("err", e.message || "Failed to load");
    }
  };

  useEffect(() => { load(); }, []);

  const onTitle = (v) => {
    setDraft(d => {
      // only auto-fill slug if user hasn't touched it / it's empty
      const auto = d.slug?.trim() ? d.slug : slugify(v);
      return { ...d, title: v, slug: auto };
    });
  };

  const create = async () => {
    if (!draft.title?.trim()) return notify("err", "Title is required");
    if (!draft.slug?.trim())  return notify("err", "Slug is required");
    setBusy(true);
    try {
      await adminApi.createNews(draft);
      setDraft({ title: "", slug: "", body: "" });
      await load();
      notify("ok", "Published");
    } catch (e) {
      notify("err", e.message || "Publish failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {toast && (
        <div style={{...toastBox, ...(toast.type==='ok'?toastOk:toastErr)}}>
          {toast.msg}
        </div>
      )}

      <h3>Create News</h3>
      <div style={grid2}>
        <div>
          <label style={label}>Title</label>
          <input style={input} value={draft.title} onChange={e=>onTitle(e.target.value)} />
        </div>
        <div>
          <label style={label}>Slug</label>
          <input style={input} value={draft.slug} onChange={e=>setDraft(d=>({...d,slug:e.target.value}))} placeholder="new-music-coming-soon" />
        </div>
      </div>
      <label style={label}>Body</label>
      <textarea style={textarea} rows={6} value={draft.body} onChange={e=>setDraft(d=>({...d,body:e.target.value}))} />
      <button style={btn} disabled={busy} onClick={create}>{busy ? "Publishing…" : "Publish"}</button>

      <h3 style={{ marginTop: 28 }}>Existing</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((n) => (
          <div key={n.id ?? n.slug} style={row}>
            <div>
              <div style={{ fontWeight: 700 }}>{n.title}</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>/news/{n.slug}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={small}
                onClick={async () => {
                  const body = prompt("Edit body", n.body ?? "") ?? n.body;
                  if (body === null) return;
                  try {
                    await adminApi.updateNews(n.id, { ...n, body });
                    await load();
                    notify("ok", "Updated");
                  } catch (e) {
                    notify("err", e.message || "Update failed");
                  }
                }}
              >
                Edit
              </button>
              <button
                style={smallOutline}
                onClick={async () => {
                  if (!confirm("Delete this post?")) return;
                  try {
                    await adminApi.deleteNews(n.id);
                    await load();
                    notify("ok", "Deleted");
                  } catch (e) {
                    notify("err", e.message || "Delete failed");
                  }
                }}
              >
                Delete
              </button>
              <a style={smallGhost} href={`/news/${n.slug}`} target="_blank" rel="noreferrer">Preview</a>
            </div>
          </div>
        ))}
        {!items.length && <div style={{ opacity: 0.7 }}>No news yet.</div>}
      </div>
    </div>
  );
}

const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const label = { fontSize: 12, opacity: 0.7, display: "block", marginTop: 12 };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#0a0a0a", color: "#fff" };
const textarea = { ...input, resize: "vertical" };
const btn = { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "#fff", color: "#000", border: 0, cursor: "pointer", fontWeight: 700 };
const row = { display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #222", borderRadius: 10, padding: 12, background: "#0a0a0a" };
const small = { padding: "6px 10px", borderRadius: 8, background: "#fff", color: "#000", border: 0, cursor: "pointer", fontWeight: 600 };
const smallOutline = { ...small, background: "transparent", color: "#fff", border: "1px solid #333" };
const smallGhost = { ...smallOutline, textDecoration: "none", display: "inline-grid", placeItems: "center" };

const toastBox = {
  position: "absolute",
  top: -8,
  right: 0,
  transform: "translateY(-100%)",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid",
  fontSize: 13,
};
const toastOk = { background: "#071a07", color: "#c8ffd0", borderColor: "#0f3" };
const toastErr = { background: "#2a0000", color: "#ff9b9b", borderColor: "#400" };
