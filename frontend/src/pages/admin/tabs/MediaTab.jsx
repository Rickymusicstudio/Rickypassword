import { useState } from "react";
import { adminApi } from "../../../lib/adminApi";

export default function MediaTab() {
  const [file, setFile] = useState(null);
  const [bucket, setBucket] = useState("covers");
  const [uploaded, setUploaded] = useState("");

  const onUpload = async () => {
    if (!file) return alert("Choose a file");
    const { url } = await adminApi.uploadFile(file, bucket);
    setUploaded(url);
  };

  return (
    <div>
      <h3>Upload to Supabase Storage</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select value={bucket} onChange={e=>setBucket(e.target.value)} style={select}>
          <option value="covers">covers</option>
          <option value="audio">audio</option>
          <option value="misc">misc</option>
        </select>
        <input type="file" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
        <button style={btn} onClick={onUpload}>Upload</button>
      </div>
      {uploaded && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Public URL</div>
          <a href={uploaded} target="_blank" rel="noreferrer" style={{ color: "#9cf" }}>{uploaded}</a>
        </div>
      )}
    </div>
  );
}

const btn = { padding: "8px 12px", borderRadius: 8, background: "#fff", color: "#000", border: 0, cursor: "pointer", fontWeight: 600 };
const select = { padding: "8px 10px", borderRadius: 8, background: "#0a0a0a", color: "#fff", border: "1px solid #333" };
 
