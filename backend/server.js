// server.js (ESM)
import express from "express";
import cors from "cors";
import morgan from "morgan";
import "express-async-errors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Security (optional but recommended)
import helmet from "helmet";

// 👇 existing routers
import releasesRouter from "./routes/releases.js";
import uploadsRouter from "./routes/uploads.js";
import downloadsRouter from "./routes/downloads.js";
import productsRouter from "./routes/products.js";
import checkoutRouter from "./routes/checkout.js";
import webhooksRouter from "./routes/webhooks.js";

// 👇 new admin routers
import adminAuth from "./routes/adminAuth.js";      // POST /login, /logout
import adminNews from "./routes/adminNews.js";      // CRUD /api/admin/news/*
import adminUpload from "./routes/adminUpload.js";  // POST file upload to Supabase

dotenv.config({ path: "../.env" }); // loads top-level .env

const app = express();
const PORT = process.env.PORT || 4000;

// If behind a proxy (Render/Heroku), trust it so secure cookies work
app.set("trust proxy", 1);

// CORS — allow credentials; optionally restrict origins via env
const allowOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / non-browser tools
      if (!origin) return cb(null, true);
      if (allowOrigins.length === 0 || allowOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// Health
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "rickypassword-backend",
    time: new Date().toISOString(),
  });
});

// Public API
app.use("/api/releases", releasesRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/downloads", downloadsRouter);
app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/webhooks", webhooksRouter);

// Admin API (auth & protected)
app.use("/api/admin", adminAuth);          // /api/admin/login, /logout
app.use("/api/admin/news", adminNews);     // protected inside router with requireAdmin
app.use("/api/admin/upload", adminUpload); // protected inside router with requireAdmin

console.log(
  "Routes mounted:",
  [
    "/api/health",
    "/api/releases",
    "/api/uploads",
    "/api/downloads",
    "/api/products",
    "/api/checkout",
    "/api/webhooks",
    "/api/admin (login/logout)",
    "/api/admin/news",
    "/api/admin/upload",
  ].join(", ")
);

// 404 handler
app.use((req, res, _next) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// Error handler (always last)
app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  const status = err.status || 500;
  res.status(status).json({ error: err?.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
