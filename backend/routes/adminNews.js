// routes/adminNews.js
import express from "express";
import { requireAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();
router.use(requireAdmin);

// TEMP in-memory store (replace with your DB/service)
let NEWS = []; // [{id, title, slug, body}]
let idSeq = 1;

router.get("/", (_req, res) => res.json(NEWS));
router.post("/", (req, res) => {
  const { title, slug, body } = req.body || {};
  const item = { id: idSeq++, title, slug, body };
  NEWS.push(item);
  res.json(item);
});
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = NEWS.findIndex(n => n.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  NEWS[idx] = { ...NEWS[idx], ...req.body };
  res.json(NEWS[idx]);
});
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const before = NEWS.length;
  NEWS = NEWS.filter(n => n.id !== id);
  if (NEWS.length === before) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
