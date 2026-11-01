// tools/import-content.mjs — command-line version of the admin's "Import existing content" button.
// Copies the built-in songs/news/gallery (src/data/*.js) into Supabase. Safe to re-run.
//
//   cd frontend
//   node --env-file=.env.local tools/import-content.mjs
//
// Needs SUPABASE_SERVICE_ROLE_KEY (Supabase → Project Settings → API → service_role) next to
// VITE_SUPABASE_URL in .env.local. Never commit that key or put it in a VITE_ variable.
import { createClient } from '@supabase/supabase-js'
import { importLegacy } from '../src/pages/admin/legacyImport.js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see ADMIN_SETUP.md).')
  process.exit(1)
}

const counts = await importLegacy(createClient(url, key, { auth: { persistSession: false } }))
console.log('Imported:', counts, '\nOpen /admin to edit everything.')
