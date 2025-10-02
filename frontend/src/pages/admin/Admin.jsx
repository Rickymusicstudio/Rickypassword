import { useState } from "react";
import Dashboard   from "../tabs/Dashboard";
import NewsTab     from "../tabs/NewsTab";
import ReleasesTab from "../tabs/ReleasesTab";
import ProductsTab from "../tabs/ProductsTab";
import MediaTab    from "../tabs/MediaTab";
import OrdersTab   from "../tabs/OrdersTab";
import { adminApi } from "../../lib/adminApi";

const TABS = ["Dashboard", "News", "Releases", "Products", "Media", "Orders"];

export default function Admin() {
  const [tab, setTab] = useState(TABS[0]);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={layout}>
      {/* Sidebar */}
      <aside style={{ ...sidebar, width: collapsed ? 72 : 240 }}>
        <div style={brand}>
          <div style={avatarCircle}>RP</div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight: 700, color: "#fff" }}>Ricky Password</div>
              <div style={{ fontSize: 12, color: "#a5b4fc" }}>● Online</div>
            </div>
          )}
        </div>

        {!collapsed && <div style={sectionLabel}>General</div>}
        <nav style={{ padding: "0 12px" }}>
          {TABS.map((t) => (
            <NavItem
              key={t}
              active={t === tab}
              collapsed={collapsed}
              label={t}
              onClick={() => setTab(t)}
            />
          ))}
        </nav>

        <button onClick={() => setCollapsed((v) => !v)} style={collapseBtn}>
          {collapsed ? "»" : "«"}
        </button>
      </aside>

      {/* Main */}
      <div style={main}>
        {/* Topbar */}
        <header style={topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setCollapsed((v) => !v)} style={hamburger}>☰</button>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Dashboard</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={badge}>2</span>
            <span style={badge}>3</span>
            <div style={userChip}>
              <div style={chipAvatar}>RP</div>
              <div style={{ fontWeight: 600 }}>Ricky Password</div>
            </div>
            <button
              onClick={async () => {
                try { await adminApi.logout(); window.location.replace("/admin/login"); } catch {}
              }}
              style={logoutBtn}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={content}>
          {tab === "Dashboard" && <Dashboard />}
          {tab === "News" && <NewsTab />}
          {tab === "Releases" && <ReleasesTab />}
          {tab === "Products" && <ProductsTab />}
          {tab === "Media" && <MediaTab />}
          {tab === "Orders" && <OrdersTab />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- components & styles ---------------- */

function NavItem({ label, active, onClick, collapsed }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...navItem,
        ...(active ? navItemActive : null),
        justifyContent: collapsed ? "center" : "flex-start",
      }}
    >
      <span aria-hidden>📊</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

/* Layout */
const layout = { display: "grid", gridTemplateColumns: "auto 1fr", minHeight: "100vh", background: "#f3f4f6" };
const sidebar = { background: "#0f172a", paddingTop: 16, position: "relative" };
const brand = { display: "flex", alignItems: "center", gap: 12, padding: "0 12px 16px" };
const avatarCircle = { width: 44, height: 44, borderRadius: 999, background: "#1d4ed8", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 };
const sectionLabel = { color: "#a3a3a3", fontSize: 12, letterSpacing: .6, padding: "8px 16px 6px" };
const navItem = { width: "100%", display: "flex", alignItems: "center", gap: 10, color: "#e5e7eb", padding: "10px 12px", borderRadius: 10, border: "1px solid transparent", background: "transparent", cursor: "pointer", marginBottom: 6 };
const navItemActive = { background: "#111827", borderColor: "#334155" };
const collapseBtn = { position: "absolute", bottom: 12, right: 12, left: 12, padding: "8px 0", borderRadius: 8, background: "#111827", color: "#e5e7eb", border: "1px solid #334155", cursor: "pointer" };

const main = { display: "grid", gridTemplateRows: "64px 1fr" };
const topbar = { background: "#ffffff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" };
const hamburger = { fontSize: 20, background: "transparent", border: "none", cursor: "pointer" };
const badge = { display: "inline-flex", width: 28, height: 28, borderRadius: 999, background: "#0ea5e9", color: "#fff", alignItems: "center", justifyContent: "center", fontWeight: 700 };
const userChip = { display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 999, padding: "6px 10px" };
const chipAvatar = { width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", background: "#1d4ed8", color: "#fff", fontSize: 12, fontWeight: 800 };
const logoutBtn = { padding: "8px 12px", background: "#ef4444", color: "#fff", border: "1px solid #ef4444", borderRadius: 8, cursor: "pointer", fontWeight: 600 };
const content = { padding: 16 };
