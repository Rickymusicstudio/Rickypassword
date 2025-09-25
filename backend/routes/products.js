import { Router } from "express";
import { supabaseService } from "../supabaseClient.js";
console.log("Products router loaded");
const router = Router();

// Public: list active products
router.get("/", async (_req, res) => {
  const { data, error } = await supabaseService
    .from("products")
    .select("id, sku, title, price_cents, kind, media_path, release_id, is_active")
    .eq("is_active", true)
    .order("id", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Admin: create product (we’ll add auth later)
router.post("/admin", async (req, res) => {
  try {
    const { sku, title, price_cents, media_path, release_id = null, kind = "digital", is_active = true } = req.body || {};
    if (!sku || !title) return res.status(400).json({ error: "sku and title are required" });

    const { data, error } = await supabaseService
      .from("products")
      .insert({ sku, title, price_cents: price_cents ?? 0, media_path, release_id, kind, is_active })
      .select("*")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
 
