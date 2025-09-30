// backend/middleware/requireAdmin.js
export function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Admin token required" });
  }
  next();
}
 
