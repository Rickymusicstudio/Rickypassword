// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// Public layout
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

// Public pages
import Home from "./pages/Home.jsx";
import Music from "./pages/Music.jsx";
import Shows from "./pages/Shows.jsx";
import News from "./pages/News.jsx";
import NewsPost from "./pages/NewsPost.jsx";
import Gallery from "./pages/Gallery.jsx";
import Bio from "./pages/Bio.jsx";
import Contact from "./pages/Contact.jsx";

// Admin pages
import AdminLogin from "./pages/admin/Login.jsx";
import Admin from "./pages/admin/Admin.jsx";

// Admin API helper
import { adminApi } from "./lib/adminApi";

export default function App() {
  const { pathname } = useLocation();
  const onAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!onAdmin && <Header />}
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/music" element={<Music />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsPost />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/bio" element={<Bio />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!onAdmin && <Footer />}
    </>
  );
}

function RequireAdmin({ children }) {
  const [status, setStatus] = useState("checking"); // checking | authed | denied

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ok = await adminApi.probe();
        if (!alive) return;
        setStatus(ok ? "authed" : "denied");
      } catch {
        if (!alive) return;
        setStatus("denied");
      }
    })();
    return () => { alive = false; };
  }, []);

  if (status === "checking") return <div style={{ padding: 24 }}>Checking admin session…</div>;
  if (status === "denied") return <Navigate to="/admin/login" replace />;
  return children;
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404</h2>
      <p>Page not found.</p>
      <p><a href="/" style={{ color: "#9cf" }}>Go home</a></p>
    </div>
  );
}
