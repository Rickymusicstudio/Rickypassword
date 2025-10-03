// backend/routes/uploads.js
import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Sanity ping
router.get("/ping", (_req, res) => res.json({ ok: true, route: "uploads" }));

/* ----------------------------------------------------------------------------
 * GET /api/uploads?list=1&bucket=<bucket>&prefix=<optional/>
 * Lists all files (recursively) in a Supabase Storage bucket.
 * - bucket defaults to STORAGE_BUCKET_GALLERY or "gallery"
 * - prefix is optional (e.g., "2024/events/")
 * Returns: { bucket, prefix, count, items: [ "path/to/file.ext", ... ] }
 * -------------------------------------------------------------------------- */
async function listAll(bucket, prefix = "") {
  const out = [];

  const walk = async (p = "") => {
    const { data, error } = await supabaseService.storage
      .from(bucket)
      .list(p, { limit: 1000 });

    if (error) throw error;

    for (const item of data || []) {
      if (item.type === "folder") {
        await walk((p ? `${p}/` : "") + item.name);
      } else {
        out.push((p ? `${p}/` : "") + item.name);
      }
    }
  };

  await walk(prefix);
  return out;
}

router.get("/", async (req, res) => {
  try {
    if (!("list" in req.query)) {
      return res
        .status(400)
        .json({ error: "Pass ?list=1 to list storage objects" });
    }

    const bucket =
      req.query.bucket ||
      process.env.STORAGE_BUCKET_GALLERY ||
      "gallery";

    const prefix = req.query.prefix || "";

    if (!supabaseService) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const items = await listAll(bucket, prefix);
    res.json({ bucket, prefix, count: items.length, items });
  } catch (e) {
    console.error("uploads list error:", e);
    res.status(500).json({ error: e.message || "List error" });
  }
});

/* ----------------------------------------------------------------------------
 * POST /api/uploads/signed  (admin only)
 * Headers:  x-admin-token: <ADMIN_TOKEN>
 * Body:     { bucket?: "covers"|"audio"|..., path: "releases/filename.ext" }
 * Returns:  { signedUrl, path, token }
 * -------------------------------------------------------------------------- */
router.post("/signed", requireAdmin, async (req, res) => {
  try {
    const { bucket = "covers", path } = req.body || {};
    if (!path) return res.status(400).json({ error: "Missing path" });
    if (!/^[\w\-./]+\.[A-Za-z0-9]+$/.test(path)) {
      return res.status(400).json({ error: "Invalid path format" });
    }
    if (!supabaseService) {
      return res.status(500).json({ error: "Supabase not configured" });
    }

    const { data, error } = await supabaseService.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) return res.status(500).json({ error: error.message });
    // data: { signedUrl, path, token }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
