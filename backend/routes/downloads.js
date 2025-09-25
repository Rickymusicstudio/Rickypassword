import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";

const router = Router();

/**
 * POST /api/downloads/signed
 * body: { path: "releases/shumaka-track.mp3", expiresSec?: 3600 }
 * returns: { signedUrl, expires_at }
 */
router.post("/signed", async (req, res) => {
  try {
    const { path, expiresSec = 3600 } = req.body || {};
    if (!path) return res.status(400).json({ error: "Missing path" });

    const { data, error } = await supabaseService
      .storage
      .from("audio")
      .createSignedUrl(path, expiresSec);

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      signedUrl: data.signedUrl,
      expires_at: new Date(Date.now() + expiresSec * 1000).toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
 
