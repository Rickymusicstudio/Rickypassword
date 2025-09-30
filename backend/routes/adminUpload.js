// routes/adminUpload.js
import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY // support both names
);

router.use(requireAdmin);

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const bucket = (req.body.bucket || "covers").trim();
    const ext = req.file.originalname.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });
    if (error) return res.status(500).json({ error: error.message });

    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return res.json({ url: data.publicUrl });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Upload failed" });
  }
});

export default router;
