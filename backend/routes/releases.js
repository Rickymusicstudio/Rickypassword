// backend/routes/releases.js
import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";

const router = Router();

const first = (...vals) => vals.find(v => v !== undefined && v !== null && v !== "");

/**
 * GET /api/releases
 * - Avoids selecting non-existent columns (select("*")).
 * - Normalizes varying schemas to { id, sku, title, cover_url, preview_url, media_path, release_date, is_published }.
 * - Filters out unpublished (if the flag exists) and sorts by date (desc) if present.
 */
router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabaseService
      .from("releases")
      .select("*"); // <-- key change: don't list columns that might not exist

    if (error) return res.status(500).json({ error: error.message });

    const rows = Array.isArray(data) ? data : [];

    const normalized = rows.map((r) => {
      const media_path = first(
        r.media_path,
        r.media,
        r.file_path,
        r.file,
        r.audio_path,
        r.audio_url,
        ""
      );

      const preview_url = first(
        r.preview_url,
        r.preview,
        media_path,
        ""
      );

      const cover_url = first(
        r.cover_url,
        r.cover,
        r.cover_path,
        r.image_url,
        r.thumb_url,
        ""
      );

      const release_date = first(
        r.release_date,
        r.released_at,
        r.date,
        r.created_at,
        null
      );

      const is_published =
        typeof r.is_published === "boolean"
          ? r.is_published
          : typeof r.published === "boolean"
          ? r.published
          : true;

      return {
        id: first(r.id, r.sku),
        sku: first(r.sku, r.id),
        title: first(r.title, r.name, ""),
        type: first(r.type, r.kind, "single"),
        description: first(r.description, ""),
        price_cents: first(r.price_cents, r.price, 0),
        cover_url,
        preview_url,
        media_path,
        release_date,
        is_published,
      };
    });

    const published = normalized.filter((x) => x.is_published !== false);
    published.sort(
      (a, b) =>
        new Date(b.release_date || 0) - new Date(a.release_date || 0)
    );

    res.json(published);
  } catch (e) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
});

/**
 * POST /api/releases/admin
 * Note: this will fail if your table doesn't have these columns.
 * Either add them in DB, or trim this insert to match your schema.
 */
router.post("/admin", async (req, res) => {
  try {
    const {
      title,
      type,
      cover_url,
      release_date,
      description,
      price_cents = 0,
      is_published = false,
      media_path = null,
      preview_url = null,
      sku = null,
    } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const { data, error } = await supabaseService
      .from("releases")
      .insert([
        {
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
        },
      ])
      .select("*")
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
});

export default router;
