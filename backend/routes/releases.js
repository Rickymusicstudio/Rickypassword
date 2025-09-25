import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";

const router = Router();

/**
 * GET /api/releases
 * Returns all published releases (public).
 */
router.get("/", async (_req, res) => {
  const { data, error } = await supabaseService
    .from("releases")
    .select(
      "id, title, type, cover_url, release_date, description, price_cents, is_published"
    )
    .eq("is_published", true)
    .order("release_date", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

/**
 * POST /api/releases/admin
 * Creates a new release (admin only — lock this down later).
 */
router.post("/admin", async (req, res) => {
  try {
    const {
      title,
      type, // "single" | "ep" | "album"
      cover_url,
      release_date,
      description,
      price_cents = 0,
      is_published = false,
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
