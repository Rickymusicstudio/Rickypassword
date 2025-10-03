// backend/routes/adminAuth.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

/**
 * Cookie config
 * - Production (Render/HTTPS): SameSite=None + Secure=true (required for cross-site)
 * - Local dev: Secure=false so the browser accepts the cookie over http://
 */
const isProd =
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  process.env.FORCE_SECURE === "true"; // optional override

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "admin_token";

const baseCookieOpts = {
  httpOnly: true,
  sameSite: isProd ? "none" : "lax",
  secure: isProd,              // must be true when SameSite=None
  path: "/",                   // allow all /api/* routes to read it
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/admin/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email },
    process.env.ADMIN_JWT_SECRET || "dev-secret",
    { expiresIn: "7d" }
  );

  res.cookie(COOKIE_NAME, token, baseCookieOpts);
  return res.json({ ok: true });
});

// POST /api/admin/logout
router.post("/logout", (_req, res) => {
  // clearCookie must match name + path + sameSite + secure to actually remove it
  res.clearCookie(COOKIE_NAME, {
    path: baseCookieOpts.path,
    sameSite: baseCookieOpts.sameSite,
    secure: baseCookieOpts.secure,
    httpOnly: baseCookieOpts.httpOnly,
  });
  return res.json({ ok: true });
});

// GET /api/admin/ping (protected sanity check)
router.get("/ping", requireAdmin, (_req, res) => {
  res.json({ ok: true, who: "admin" });
});

export default router;
