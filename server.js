// server.js (project root)
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// If behind a proxy (Render/Heroku/etc.) this is required for Secure cookies & rate-limit
app.set("trust proxy", 1);

/* ----------------------------- CORS allow list ----------------------------- */
/**
 * Allow:
 *  - local dev: http://localhost:5173 (and 5174 for Vite alt port)
 *  - SITE_URL (e.g. https://rickypassword.com)
 *  - EXTRA_ORIGINS (comma-separated, supports wildcards like https://*.vercel.app)
 *
 * Make sure envs are set on Render:
 *   SITE_URL=https://rickypassword.com
 *   EXTRA_ORIGINS=https://rickypassword.vercel.app
 */
function normalize(s) {
  return String(s).trim().replace(/\/+$/, ""); // strip trailing slash
}

const RAW_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.SITE_URL,
  ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(",") : []),
]
  .filter(Boolean)
  .map(normalize);

// Support wildcards like https://*.vercel.app
function compileRule(rule) {
  if (rule.includes("*")) {
    const re = new RegExp(
      "^" +
        rule
          .replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&") // escape regex specials
          .replace(/\\\*/g, ".*") +
        "$"
    );
    return { kind: "re", re };
  }
  return { kind: "eq", val: rule };
}
const ORIGIN_RULES = RAW_ORIGINS.map(compileRule);

function isAllowed(origin) {
  if (!origin) return true; // server-to-server / curl (no Origin header)
  const o = normalize(origin);
  return ORIGIN_RULES.some((r) => (r.kind === "eq" ? o === r.val : r.re.test(o)));
}

// Keep caches correct when origin varies
app.use((req, res, next) => {
  res.header("Vary", "Origin");
  next();
});

const corsOptions = {
  origin(origin, cb) {
    if (isAllowed(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true, // => Access-Control-Allow-Credentials: true
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600, // cache preflight for 10 minutes
};

// CORS must be BEFORE helmet/rate-limit/routers and handle all preflights
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* --------------------------------- Security -------------------------------- */
app.use(
  helmet({
    // Let images/audio be embedded from storage/CDNs without CORP errors
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* --------------------------------- Parsers --------------------------------- */
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

/* --------------------------------- Logging --------------------------------- */
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
// Contact (already in your repo)
import contactRouter from "./api/contact.js";
app.use("/api/contact", contactRouter);

// Public site APIs (your existing backend/routes)
import uploadsRouter from "./backend/routes/uploads.js";
import downloadsRouter from "./backend/routes/downloads.js";
import productsRouter from "./backend/routes/products.js";
import checkoutRouter from "./backend/routes/checkout.js";
import webhooksRouter from "./backend/routes/webhooks.js";
import releasesRouter from "./backend/routes/releases.js"; // <-- added

app.use("/api/uploads", uploadsRouter);
app.use("/api/downloads", downloadsRouter);
app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/releases", releasesRouter); // <-- added

// Optional alias: /api/download -> same router as /api/downloads
app.use("/api/download", downloadsRouter);

// Admin auth (keep your existing login/logout/ping)
import adminAuth from "./backend/routes/adminAuth.js"; // /login, /logout, /ping
app.use("/api/admin", adminAuth);

// NEW: Content + Admin stats powered by frontend/src/data/*
import contentRoutes from "./backend/server/admin.routes.js";
import viewsRoutes from "./backend/server/views.routes.js";
import crudRoutes from "./backend/server/crud.routes.js";

app.use("/api", crudRoutes);
app.use("/api", viewsRoutes);   // GET /api/admin/views/summary, POST /api/track/article-view
app.use("/api", contentRoutes); // releases/news/gallery + /api/admin/stats

/* ------------------------------- Health check ------------------------------ */
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "rickypassword-backend",
    time: new Date().toISOString(),
    allowList: RAW_ORIGINS,
    dataRoot: process.env.DATA_ROOT || process.cwd(),
    dataDir: process.env.DATA_DIR || "frontend/src/data",
  });
});

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
  console.log(
    `API ready on http://localhost:${PORT}\n` +
      "Routes: /api/health, /api/contact, /api/uploads, /api/downloads (/api/download alias), /api/products, /api/checkout, /api/webhooks,\n" +
      "        /api/releases, /api/news, /api/gallery, /api/admin/stats, /api/admin/*"
  );
});
