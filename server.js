// server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import contactRouter from './api/contact.js' // <- default export expected

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

/* ----------------------------- CORS allow list ----------------------------- */
/**
 * We allow:
 *  - local dev: http://localhost:5173
 *  - Vercel preview/prod: https://<your-vercel>.vercel.app (pass via SITE_URL)
 *  - custom domain: https://rickypassword.com (also via SITE_URL)
 *  - optional extras via EXTRA_ORIGINS (comma-separated)
 */
const allowList = new Set(['http://localhost:5173'])

// Add SITE_URL if provided (e.g. https://<your-vercel>.vercel.app or https://rickypassword.com)
if (process.env.SITE_URL) allowList.add(process.env.SITE_URL.trim())

// Add any extra origins as comma-separated list
if (process.env.EXTRA_ORIGINS) {
  process.env.EXTRA_ORIGINS.split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(o => allowList.add(o))
}

// Helpful in Render/Heroku style proxies (needed by rate limit, etc.)
app.set('trust proxy', 1)

/* --------------------------------- Security -------------------------------- */
app.use(
  helmet({
    // Let images/audio be served cross-origin without CORP errors
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)

/* --------------------------------- Parsers --------------------------------- */
app.use(express.json({ limit: '1mb' }))

/* ---------------------------------- CORS ----------------------------------- */
const corsOptions = {
  origin(origin, cb) {
    // Allow server-to-server / curl (no origin)
    if (!origin) return cb(null, true)
    return cb(null, allowList.has(origin))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: false,
}
app.use(cors(corsOptions))
// Respond to preflight quickly
app.options('*', cors(corsOptions))

/* ----------------------------- Basic rate-limit ---------------------------- */
app.use(
  '/api/',
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 120, // 120 requests per IP / window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
)

/* ------------------------------- Health check ------------------------------ */
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'rickypassword-backend',
    time: new Date().toISOString(),
    allowList: Array.from(allowList),
  })
})

/* --------------------------------- Routes ---------------------------------- */
// Mount at /api/contact and keep router.post('/') inside api/contact.js
app.use('/api/contact', contactRouter)

/* ------------------------------ Not found / err ---------------------------- */
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ ok: false, error: 'Not found' })
  }
  next()
})

app.use((err, req, res, next) => {
  console.error('Uncaught error:', err)
  const status = err.status || 500
  res.status(status).json({ ok: false, error: err.message || 'Server error' })
})

/* --------------------------------- Listen ---------------------------------- */
app.listen(PORT, () => {
  console.log(`API ready on http://localhost:${PORT}`)
})
