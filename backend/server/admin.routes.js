import express from "express";
import { loadSongs, loadNews, loadGallery } from "./loadLocalArrays.js";

const router = express.Router();

// Public lists (your admin UI fetches these too)
router.get("/releases", async (_req, res) => {
  try {
    const songs = await loadSongs();
    res.json(songs);
  } catch (e) {
    res.status(500).json({ error: e.message || "releases failed" });
  }
});

router.get("/news", async (_req, res) => {
  try {
    const news = await loadNews();
    res.json(news);
  } catch (e) {
    res.status(500).json({ error: e.message || "news failed" });
  }
});

router.get("/gallery", async (_req, res) => {
  try {
    const gallery = await loadGallery();
    res.json(gallery);
  } catch (e) {
    res.status(500).json({ error: e.message || "gallery failed" });
  }
});

// Admin stats (cards at the top of your dashboard)
router.get("/admin/stats", async (_req, res) => {
  try {
    const [songs, gallery, news] = await Promise.all([
      loadSongs(),
      loadGallery(),
      loadNews(),
    ]);

    // Sparkline placeholder — optional
    const articleViews30d = [];

    res.json({
      songs: songs.length,          // expect 16
      pictures: gallery.length,     // expect 17
      articles: news.length,        // expect 3
      articleViews30d,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "stats failed" });
  }
});

export default router;
 
