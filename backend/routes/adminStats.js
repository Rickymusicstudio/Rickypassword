import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { supabaseService } from "../supabaseClient.js";

const router = Router();

// GET /api/admin/stats  (counts + fake 30d series for now)
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    // Songs from releases (published)
    const rel = await supabaseService
      .from("releases")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);

    const songs = rel?.count || 0;

    // Pictures from storage bucket "gallery"
    let pictures = 0;
    try {
      const { data, error } = await supabaseService.storage
        .from("gallery")
        .list("", { limit: 1000 });
      if (!error && Array.isArray(data)) pictures = data.length;
    } catch {}

    // Articles (if you have a news table; otherwise leave 0)
    let articles = 0;
    try {
      const art = await supabaseService
        .from("news")
        .select("id", { count: "exact", head: true });
      articles = art?.count || 0;
    } catch {}

    // Simple synthetic 30d series (replace with your real analytics later)
    const viewsSeries = Array.from({ length: 30 }, (_, i) => 180 + i * 8);

    res.json({
      songs,
      pictures,
      articles,
      articleViews: 0,
      viewsSeries,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
});

export default router;
