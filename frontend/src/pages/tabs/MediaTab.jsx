 
import { useState } from "react";
import { adminApi } from "../../lib/adminApi.js";


export default function MediaTab() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function upload(e) {
    e.preventDefault();
    if (!file) return;
    setMsg("Uploading...");
    try {
      const out = await adminApi.uploadFile(file, "covers");
      setMsg(`Uploaded: ${out?.path || "ok"}`);
    } catch (e) {
      setMsg(String(e.message || e));
    }
  }

  return (
    <div style={card}>
      <h3 style={{ margin:0, marginBottom:12 }}>Upload media</h3>
      <form onSubmit={upload} style={{ display:"flex", gap:10 }}>
        <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
        <button style={btn}>Upload</button>
      </form>
      {msg && <div style={{ marginTop:10, color:"#475569" }}>{msg}</div>}
    </div>
  );
}
const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 };
const btn = { padding:"10px 12px", borderRadius:8, border:"1px solid #1d4ed8", background:"#1d4ed8", color:"#fff", fontWeight:600, cursor:"pointer" };
