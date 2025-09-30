// server.js (project root)
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// ----- Load env -----
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// If behind a proxy (Render/Heroku), trust it so secure cookies/IPs work
app.set("trust proxy", 1);

/* ----------------------------- CORS allow list ----------------------------- */
/**
 * We allow:
 *  - local dev: http://localhost:5173 (+5174 if Vite picks another port)
 *  - SITE_URL (e.g. https://<your-vercel>.vercel.app or https://rickypassword.com)
 *  - EXTRA_ORIGINS (comma-separated)
 */
const allowList = new Set(["http://localhost:5173", "http://localhost:5174"]);
if (process.env.SITE_URL) allowList.add(process.env.SITE_URL.trim());
if (process.env.EXTRA_ORIGINS) {
  process.env.EXTRA_ORIGINS.split(",").map(s => s.trim()).filter(Boolean).forEach(o => allowList.add(o));
}

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);                 // server-to-server / curl
    if (allowList.has(origin)) return cb(null, true);   // allowed
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // needed for HttpOnly cookies
};

/* --------------------------------- Security -------------------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow images/audio embeds
  })
);

/* --------------------------------- Parsers --------------------------------- */
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // fast preflight
app.use(morgan("dev"));

/* ----------------------------- Basic rate-limit ---------------------------- */
app.use(
  "/api/",
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

/* --------------------------------- Routers --------------------------------- */
// Contact (you already had this at project root)
import contactRouter from "./api/contact.js";
app.use("/api/contact", contactRouter);

// Public site APIs (live under backend/routes)
import releasesRouter from "./backend/routes/releases.js";
import uploadsRouter from "./backend/routes/uploads.js";
import downloadsRouter from "./backend/routes/downloads.js";
import productsRouter from "./backend/routes/products.js";
import checkoutRouter from "./backend/routes/checkout.js";
import webhooksRouter from "./backend/routes/webhooks.js";

app.use("/api/releases", releasesRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/downloads", downloadsRouter);
app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/webhooks", webhooksRouter);

// Admin APIs (new)
import adminAuth from "./backend/routes/adminAuth.js";      // /api/admin/login, /logout, /ping
import adminNews from "./backend/routes/adminNews.js";      // protected CRUD
import adminUpload from "./backend/routes/adminUpload.js";  // protected upload to Supabase

app.use("/api/admin", adminAuth);
app.use("/api/admin/news", adminNews);
app.use("/api/admin/upload", adminUpload);

/* ------------------------------- Health check ------------------------------ */
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "rickypassword-backend",
    time: new Date().toISOString(),
    allowList: Array.from(allowList),
  });
});

console.log(
  "Routes mounted:",
  [
    "/api/health",
    "/api/contact",
    "/api/releases",
    "/api/uploads",
    "/api/downloads",
    "/api/products",
    "/api/checkout",
    "/api/webhooks",
    "/api/admin (login/logout/ping)",
    "/api/admin/news",
    "/api/admin/upload",
  ].join(", ")
);

/* ------------------------------ Not found / err ---------------------------- */
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  next();
});

app.use((err, _req, res, _next) => {
  console.error("Uncaught error:", err?.message || err);
  const status = err.status || 500;
  res.status(status).json({ ok: false, error: err?.message || "Server error" });
});

/* --------------------------------- Listen ---------------------------------- */
app.listen(PORT, () => {
  console.log(`API ready on http://localhost:${PORT}`);
});
