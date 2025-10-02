import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi.js";


export default function NewsTab() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    try {
      const data = await adminApi.listNews();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg("Could not load news. (Make sure /api/admin/news exists)");
    }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setMsg("");
    try {
      await adminApi.createNews({ title, slug, body });
      setTitle(""); setSlug(""); setBody("");
      await load();
      setMsg("Published!");
    } catch (e) {
      setMsg(String(e.message || e));
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={card}>
        <h3 style={{ margin: 0, marginBottom: 12 }}>Create News</h3>
        <form onSubmit={create} style={{ display:"grid", gap: 10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap: 10 }}>
            <input style={input} placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <input style={input} placeholder="Slug" value={slug} onChange={e=>setSlug(e.target.value)} />
          </div>
          <textarea style={{ ...input, height: 140 }} placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} />
          {msg && <div style={note}>{msg}</div>}
          <button style={btn}>Publish</button>
        </form>
      </div>

      <div style={card}>
        <h3 style={{ margin: 0, marginBottom: 12 }}>Existing</h3>
        {!items.length ? <div style={{ color:"#64748b" }}>No news yet.</div> : (
          <div style={{ display:"grid", gap: 8 }}>
            {items.map(n => (
              <div key={n.id} style={row}>
                <div>
                  <div style={{ fontWeight:700, color:"#0f172a" }}>{n.title}</div>
                  <div style={{ color:"#64748b", fontSize:12 }}>{n.slug}</div>
                </div>
                <button
                  onClick={async ()=>{ try{ await adminApi.deleteNews(n.id); await load(); }catch(e){ setMsg(String(e.message||e)); } }}
                  style={delBtn}
                >Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 };
const input = { padding:"10px 12px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff" };
const btn = { padding:"10px 12px", width:140, borderRadius:8, border:"1px solid #1d4ed8", background:"#1d4ed8", color:"#fff", fontWeight:600, cursor:"pointer" };
const delBtn = { ...btn, width:90, background:"#ef4444", borderColor:"#ef4444" };
const note = { padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:8, background:"#f8fafc", color:"#111827", width:"fit-content" };
const row = { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px dashed #e5e7eb" };
 
