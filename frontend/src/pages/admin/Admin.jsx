import { useState } from "react";
import NewsTab from "./tabs/NewsTab.jsx";
import ReleasesTab from "./tabs/ReleasesTab.jsx";
import ProductsTab from "./tabs/ProductsTab.jsx";
import MediaTab from "./tabs/MediaTab.jsx";
import OrdersTab from "./tabs/OrdersTab.jsx";
import { adminApi } from "../../lib/adminApi";

const TABS = ["News", "Releases", "Products", "Media", "Orders"];

export default function Admin() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Admin</h1>
        <button
          onClick={async () => { try { await adminApi.logout(); window.location.replace("/admin/login"); } catch {} }}
          style={btnGhost}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={t === tab ? tabActive : tabBtn}>{t}</button>
        ))}
      </div>

      <div style={panel}>
        {tab === "News" && <NewsTab />}
        {tab === "Releases" && <ReleasesTab />}
        {tab === "Products" && <ProductsTab />}
        {tab === "Media" && <MediaTab />}
        {tab === "Orders" && <OrdersTab />}
      </div>
    </div>
  );
}

const tabBtn = { padding: "8px 12px", background: "#0b0b0b", border: "1px solid #222", borderRadius: 999, color: "#aaa", cursor: "pointer" };
const tabActive = { ...tabBtn, background: "#fff", color: "#000", borderColor: "#fff" };
const panel = { background: "#0b0b0b", border: "1px solid #222", borderRadius: 12, padding: 16 };
const btnGhost = { padding: "8px 12px", background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#fff", cursor: "pointer" };
 
