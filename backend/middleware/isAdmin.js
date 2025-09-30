// middlewares/isAdmin.js
import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.admin_token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    if (!payload?.role || payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    req.admin = { email: payload.email };
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
 
