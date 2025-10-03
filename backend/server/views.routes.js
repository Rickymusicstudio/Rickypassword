// backend/server/views.routes.js
import express from "express";
import crypto from "node:crypto";
import { getSupa } from "./supabase.js";

const router = express.Router();

/**
 * POST /api/track/article-view
 * Body: { slug }
 * Behavior:
 *  - If increment function exists -> upsert into daily table
 *  - Always try to insert a raw hit (best effort)
 *  - If Supabase env missing -> no-op, return {ok:true, disabled:true}
 */
router.post("/track/article-view", async (req, res) => {
  const supa = getSupa();
  if (!supa) return res.json({ ok: true, disabled: true });

  try {
    const { slug } = req.body || {};
    if (!slug) return res.status(400).json({ error: "slug required" });

    const day = new Date().toISOString().slice(0, 10);
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "";
    const ua = String(req.headers["user-agent"] || "");
    const ip_hash = ip ? crypto.createHash("sha256").update(ip).digest("hex") : null;

    // Try atomic daily increment via RPC (if you created it in SQL)
    // create or replace function public.increment_article_view(p_day date, p_slug text) ...
    try {
      const { error: rpcErr } = await supa.rpc("increment_article_view", {
        p_day: day,
        p_slug: slug,
      });
      if (rpcErr) {
        // RPC missing or failing — ignore; raw hit will still be stored
        // console.warn("[views] RPC failed:", rpcErr.message);
      }
    } catch {
      /* ignore */
    }

    // Always store a raw hit (best effort)
    try {
      await supa.from("article_views_raw").insert({ slug, ip_hash, ua });
    } catch {
      /* ignore */
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "track failed" });
  }
});

/**
 * GET /api/admin/views/summary?days=30
 * Returns { series: [{day, views}], rows?:[...] }
 * - First tries the daily aggregate table
 * - If not available, aggregates from raw hits in Node
 */
router.get("/admin/views/summary", async (req, res) => {
  const supa = getSupa();
  if (!supa) return res.json({ series: [], rows: [], disabled: true });

  try {
    const days = Math.min(parseInt(req.query.days || "30", 10), 90);
    const since = new Date(Date.now() - days * 864e5);
    const sinceStr = since.toISOString().slice(0, 10); // YYYY-MM-DD

    // Try daily table first
    try {
      const { data, error } = await supa
        .from("article_views_daily")
        .select("day, slug, views")
        .gte("day", sinceStr)
        .order("day", { ascending: true });

      if (!error && Array.isArray(data)) {
        const byDay = new Map();
        for (const r of data) byDay.set(r.day, (byDay.get(r.day) || 0) + (r.views || 0));
        const series = Array.from(byDay.entries()).map(([day, views]) => ({ day, views }));
        return res.json({ series, rows: data });
      }
    } catch {
      /* fall through to raw */
    }

    // Fallback: aggregate from raw hits (no SQL functions needed)
    const { data: raw = [], error: rawErr } = await supa
      .from("article_views_raw")
      .select("ts, slug")
      .gte("ts", since.toISOString()); // filter on timestamp

    if (rawErr) throw rawErr;

    const byDay = new Map();
    for (const r of raw) {
      const d = new Date(r.ts);
      // Normalize to YYYY-MM-DD in server timezone
      const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
        .toISOString()
        .slice(0, 10);
      byDay.set(day, (byDay.get(day) || 0) + 1);
    }
    const series = Array.from(byDay.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([day, views]) => ({ day, views }));

    res.json({ series, rows: [] });
  } catch (e) {
    res.status(500).json({ error: e.message || "summary failed" });
  }
});

export default router;
