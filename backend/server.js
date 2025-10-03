import express from "express";
import cors from "cors";
import morgan from "morgan";
import "express-async-errors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import releasesRouter from "./routes/releases.js";
import uploadsRouter from "./routes/uploads.js";
import downloadsRouter from "./routes/downloads.js";
import productsRouter from "./routes/products.js";
import checkoutRouter from "./routes/checkout.js";
import webhooksRouter from "./routes/webhooks.js";
import adminAuth from "./routes/adminAuth.js";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 4000;

/* ----------------------------- CORS allowlist ----------------------------- */
// allow dev + your deployed site(s)
const allowList = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
]);
if (process.env.SITE_URL) allowList.add(process.env.SITE_URL.trim());
if (process.env.EXTRA_ORIGINS) {
  process.env.EXTRA_ORIGINS
    .split(",")
    .map(s => s.trim())
    .forEach(o => o && allowList.add(o));
}

// IMPORTANT for Secure cookies behind Render/Proxy
app.set("trust proxy", 1);

// Build strict CORS options that include credentials + preflight
const corsOptions = {
  origin(origin, cb) {
    // allow same-origin / curl (no Origin header)
    if (!origin) return cb(null, true);
    if (allowList.has(origin)) return cb(null, true);
    cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
// make sure preflight carries the same headers
app.options("*", cors(corsOptions));

/* ----------------------------- core middleware ---------------------------- */
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

/* --------------------------- health check ------------------------ */
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "rickypassword-backend",
    time: new Date().toISOString(),
  });
});

/* ----------------------------- routes ---------------------------- */
app.use("/api/releases", releasesRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/downloads", downloadsRouter);
app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/admin", adminAuth);

/* ------------------------- 404 for /api/* ------------------------ */
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  next();
});

/* ---------------------- global error handler --------------------- */
app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err?.message || "Server error" });
});

/* ------------------------------- boot ---------------------------- */
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
