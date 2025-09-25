import express from "express";
import cors from "cors";
import morgan from "morgan";
import "express-async-errors";
import dotenv from "dotenv";

// 👇 import your routes
import releasesRouter from "./routes/releases.js";
import uploadsRouter from "./routes/uploads.js";
import downloadsRouter from "./routes/downloads.js";
import productsRouter from "./routes/products.js";
import checkoutRouter from "./routes/checkout.js";
import webhooksRouter from "./routes/webhooks.js";





dotenv.config({ path: "../.env" }); // loads top-level .env

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "rickypassword-backend",
    time: new Date().toISOString(),
  });
});

// 👇 mount routers here
app.use("/api/releases", releasesRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/downloads", downloadsRouter);
app.use("/api/products", productsRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/webhooks", webhooksRouter);

console.log("Routes mounted: /api/releases, /api/uploads");

// error handler (always last)
app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err?.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
