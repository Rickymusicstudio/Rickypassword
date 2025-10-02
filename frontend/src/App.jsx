// src/App.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

/* -------- Public pages -------- */
import Home from "./pages/Home.jsx";
import Music from "./pages/Music.jsx";
import Shows from "./pages/Shows.jsx";
import News from "./pages/News.jsx";
import NewsPost from "./pages/NewsPost.jsx";
import Gallery from "./pages/Gallery.jsx";
import Bio from "./pages/Bio.jsx";
import Contact from "./pages/Contact.jsx";

/* -------- Admin pages -------- */
import AdminLogin from "./pages/admin/Login.jsx"; // make sure this file exists
import Admin from "./pages/admin/Admin.jsx";      // Pluto-style shell with tabs

/* Public layout: wraps pages with site chrome */
function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

/* Admin layout: Admin.jsx renders its own shell (no site chrome here) */
function AdminLayout() {
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/music" element={<Music />} />
        <Route path="/shows" element={<Shows />} />

        {/* News list + detail */}
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsPost />} />

        {/* Other pages */}
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/bio" element={<Bio />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Admin area */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="login" element={<AdminLogin />} />
        <Route index element={<Admin />} />
      </Route>

      {/* Catch-all → home (or replace with a NotFound page if you have one) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
