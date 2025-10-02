import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi.js";


export default function OrdersTab() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.listOrders();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setMsg("Orders endpoint not available yet.");
      }
    })();
  }, []);

  return (
    <div style={card}>
      <h3 style={{ margin:0, marginBottom:12 }}>Orders</h3>
      {msg && <div style={note}>{msg}</div>}
      {!items.length ? <div style={{ color:"#64748b" }}>No orders yet.</div> : (
        <ul style={{ margin:0, paddingLeft:18 }}>
          {items.map(o => <li key={o.id}>{o.id} · {o.total}</li>)}
        </ul>
      )}
    </div>
  );
}
const card = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 };
const note = { padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:8, background:"#f8fafc", color:"#111827", width:"fit-content" };
 
