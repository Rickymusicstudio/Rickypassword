
import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Sanity ping
router.get("/ping", (_req, res) => res.json({ ok: true, route: "uploads" }));

/**
 * POST /api/uploads/signed
 * Headers: x-admin-token: <ADMIN_TOKEN>
 * Body: { bucket?: "covers" | "audio", path: "releases/filename.ext" }
 * Returns: { signedUrl, path, token }
 */
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

    const { data, error } = await supabaseService
      .storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data); // { signedUrl, path, token }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
