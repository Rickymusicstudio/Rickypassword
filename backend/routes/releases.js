// backend/routes/releases.js
import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";

const router = Router();

/**
 * GET /api/releases
 * Public: list of published releases (newest first).
 * We include media/preview fields so the Music page can play & download.
 */
router.get("/", async (_req, res) => {
  const { data, error } = await supabaseService
    .from("releases")
    .select(`
      id,
      title,
      type,
      cover_url,
      release_date,
      description,
      price_cents,
      is_published,
      media_path,
      preview_url,
      sku
    `)
    .eq("is_published", true)
    .order("release_date", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

/**
 * POST /api/releases/admin
 * Creates a new release (later you can protect this with your admin middleware).
 */
router.post("/admin", async (req, res) => {
  try {
    const {
      title,
      type,                // "single" | "ep" | "album"
      cover_url,
      release_date,
      description,
      price_cents = 0,
      is_published = false,
      media_path = null,   // <-- optional audio file path (e.g. "/audio/track.mp3")
      preview_url = null,  // <-- optional preview (if different from media_path)
      sku = null
    } = req.body || {};

    if (!title || !type) {
      return res.status(400).json({ error: "title and type are required" });
    }

    const { data, error } = await supabaseService
      .from("releases")
      .insert({
        title,
        type,
        cover_url,
        release_date,
        description,
        price_cents,
        is_published,
        media_path,
        preview_url,
        sku,
      })
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
