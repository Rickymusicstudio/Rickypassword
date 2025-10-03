// ESM
import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const token =
    req.cookies?.admin_token ||
    (req.get("authorization") || "").replace(/^Bearer\s+/i, "");

  if (!token) return res.status(401).json({ ok: false, error: "Unauthorized" });

  try {
    const payload = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || "dev-secret"
    );
    // attach info for downstream if needed
    req.admin = { email: payload.email || "admin" };
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
}
