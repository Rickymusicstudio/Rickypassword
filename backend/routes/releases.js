// backend/routes/releases.js
import { Router } from "express";
// Pull the curated songs list from the frontend data file
// (path is from backend/routes/ -> ../../frontend/src/data/songs.js)
import { songs as SONGS } from "../../frontend/src/data/songs.js";

const router = Router();

const first = (...vals) => vals.find(v => v !== undefined && v !== null && v !== "");

router.get("/", async (_req, res) => {
  try {
    const rows = Array.isArray(SONGS) ? SONGS : [];

    // Normalize to the shape the frontend expects
    const normalized = rows.map((r, idx) => {
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
        r.released_at,  // some items use this
        r.date,
        r.created_at,
        null
      );

      // published flag (default true)
      const is_published =
        typeof r.is_published === "boolean"
          ? r.is_published
          : typeof r.published === "boolean"
          ? r.published
          : true;

      return {
        id: first(r.id, r.sku, idx + 1),
        sku: first(r.sku, r.id, `SKU-${idx + 1}`),
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

    // Filter unpublished and sort newest first
    const published = normalized.filter(x => x.is_published !== false);
    published.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));

    res.json(published);
  } catch (e) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
});

export default router;
