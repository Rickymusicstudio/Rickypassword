import express from "express";
import { loadSongs, loadNews, loadGallery } from "./loadLocalArrays.js";
import { readJsonOrJs, saveSongs, saveNews, saveGallery } from "./writeData.js";

const router = express.Router();

// TODO: replace this with your real admin auth check
function requireAdmin(req, res, next) {
  if (process.env.NODE_ENV !== "production") return next();
  // in prod, validate your admin cookie/session here
  return res.status(401).json({ error: "Unauthorized" });
}

function ensureId(item) {
  return item?.id ?? crypto.randomUUID();
}

router.get("/admin/content", requireAdmin, async (_req, res) => {
  const [songs, news, gallery] = await Promise.all([
    readJsonOrJs(loadSongs, "songs.json"),
    readJsonOrJs(loadNews, "news.json"),
    readJsonOrJs(loadGallery, "gallery.json"),
  ]);
  res.json({ songs, news, gallery });
});

// SONGS
router.post("/admin/songs", requireAdmin, async (req, res) => {
  const list = await readJsonOrJs(loadSongs, "songs.json");
  const item = { ...req.body, id: ensureId(req.body) };
  list.unshift(item);
  await saveSongs(list);
  res.json(item);
});

router.put("/admin/songs/:id", requireAdmin, async (req, res) => {
  const list = await readJsonOrJs(loadSongs, "songs.json");
  const idx = list.findIndex(x => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  list[idx] = { ...list[idx], ...req.body, id: list[idx].id };
  await saveSongs(list);
  res.json(list[idx]);
});

router.delete("/admin/songs/:id", requireAdmin, async (req, res) => {
  const list = await readJsonOrJs(loadSongs, "songs.json");
  const next = list.filter(x => String(x.id) !== String(req.params.id));
  await saveSongs(next);
  res.json({ ok: true });
});

// Repeat the same for news & gallery:
for (const key of ["news", "gallery"]) {
  const load = key === "news" ? loadNews : loadGallery;
  const saver = key === "news" ? saveNews : saveGallery;

  router.post(`/admin/${key}`, requireAdmin, async (req, res) => {
    const list = await readJsonOrJs(load, `${key}.json`);
    const item = { ...req.body, id: ensureId(req.body) };
    list.unshift(item);
    await saver(list);
    res.json(item);
  });

  router.put(`/admin/${key}/:id`, requireAdmin, async (req, res) => {
    const list = await readJsonOrJs(load, `${key}.json`);
    const idx = list.findIndex(x => String(x.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    list[idx] = { ...list[idx], ...req.body, id: list[idx].id };
    await saver(list);
    res.json(list[idx]);
  });

  router.delete(`/admin/${key}/:id`, requireAdmin, async (req, res) => {
    const list = await readJsonOrJs(load, `${key}.json`);
    const next = list.filter(x => String(x.id) !== String(req.params.id));
    await saver(next);
    res.json({ ok: true });
  });
}

export default router;
 
