// src/pages/admin/tabs/OrdersTab.jsx
import { useEffect, useState } from "react";
import { adminApi } from "../../../lib/adminApi";

export default function OrdersTab() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.listOrders();
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div>
      <h3>Orders</h3>
      {err && <div style={errBox}>{err}</div>}
      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>SKU</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.sku || o.product_sku}</td>
                <td>{o.amount}</td>
                <td>{o.status}</td>
                <td>{o.created_at || o.createdAt}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} style={{ opacity: 0.7, textAlign: "center", padding: 16 }}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const table = { width: "100%", borderCollapse: "collapse", color: "#fff" };
const errBox = { marginTop: 10, padding: "8px 10px", background: "#2a0000", border: "1px solid #400", borderRadius: 8, color: "#ff9b9b", fontSize: 13 };
 
