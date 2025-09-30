// routes/adminAuth.js
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/ping", (_req, res) => res.json({ ok: true, who: "adminAuth" }));

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ email, role: "admin" }, process.env.ADMIN_JWT_SECRET, { expiresIn: "2h" });
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProd, // false on localhost
    maxAge: 2 * 60 * 60 * 1000,
  });
  res.json({ ok: true });
});

router.post("/logout", (_req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("admin_token", { httpOnly: true, sameSite: "strict", secure: isProd });
  res.json({ ok: true });
});

export default router;
