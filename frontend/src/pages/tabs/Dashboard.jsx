import { useEffect, useState } from "react";
import { adminApi } from "../../lib/adminApi.js";

/** UI bits */
const grid4 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 };
const card = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, boxShadow: "0 1px 1px rgba(16,24,40,.03)" };
const icon = { width: 48, height: 48, borderRadius: 12, display: "grid", placeItems: "center", background: "#f1f5f9", fontSize: 24 };
const kpiValue = { fontSize: 24, fontWeight: 800, color: "#0f172a" };
const muted = { color: "#64748b", fontSize: 12 };
const bold = { fontWeight: 700, color: "#0f172a" };

function Card({ children }) { return <div style={card}>{children}</div>; }

function MiniArea({ data, height = 200 }) {
  const width = 800, max = Math.max(...data, 1), step = width / Math.max(data.length - 1, 1);
  const y = (v) => height - (v / max) * (height - 12);
  const pts = data.map((v, i) => `${i * step},${y(v)}`).join(" ");
  const area = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height }}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25,0.5,0.75].map(p => (
        <line key={p} x1="0" x2={width} y1={height * p} y2={height * p} stroke="#e5e7eb" />
      ))}
      <polyline points={area} fill="url(#grad)" />
      <polyline points={pts} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    songs: 0,
    pictures: 0,
    articles: 0,
    articleViews: 0,
    viewsSeries: [],
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await adminApi.siteStats();   // uses /api/admin/stats if present, or graceful fallbacks
        if (alive) setStats(s);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const KPIS = [
    { label: "Songs",        value: String(stats.songs ?? 0),         icon: "🎵" },
    { label: "Pictures",     value: String(stats.pictures ?? 0),      icon: "🖼️" },
    { label: "Articles",     value: String(stats.articles ?? 0),      icon: "📝" },
    { label: "Article Views",value: String(stats.articleViews ?? 0),  icon: "👀" },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={grid4}>
        {KPIS.map((k) => (
          <Card key={k.label}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={icon}>{k.icon}</div>
              <div>
                <div style={kpiValue}>{loading ? "…" : k.value}</div>
                <div style={muted}>{k.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ padding: "12px 12px 0", fontWeight: 700, color: "#0f172a" }}>
          Article Views (last 30d)
        </div>
        <div style={{ padding: 12 }}>
          <MiniArea data={stats.viewsSeries?.length ? stats.viewsSeries : [5,8,6,10,7,9,11,10,12,13,15,14]} height={220} />
        </div>
      </Card>
    </div>
  );
}
