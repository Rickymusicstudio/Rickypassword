// backend/routes/analytics.js
import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";

const router = Router();

/**
 * POST /api/analytics/view
 * { slug: "my-article-slug" }
 * Stores one row in page_views (server-side write, no RLS headaches).
 */
router.post("/view", async (req, res) => {
  try {
    const { slug } = req.body || {};
    if (!slug) return res.status(400).json({ error: "slug is required" });

    const { error } = await supabaseService
      .from("page_views")
      .insert({ slug });

    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    console.error("analytics/view error:", e);
    res.status(500).json({ error: e.message || "Failed to record view" });
  }
});

export default router;
 
