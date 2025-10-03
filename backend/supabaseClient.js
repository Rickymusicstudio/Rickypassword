// backend/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load .env from project root; if not found, try ../.env relative to this file
dotenv.config();
if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_ANON_KEY ||
  !(process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_KEY)
) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
// Accept any of these names for the service key
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_KEY;

const must = (name, val) => {
  if (!val) throw new Error(`Missing ${name} in .env`);
  return val;
};

// Public client (read-only)
export const supabaseAnon = createClient(
  must("SUPABASE_URL", url),
  must("SUPABASE_ANON_KEY", anonKey),
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Service-role client (admin / bypass RLS)
export const supabaseService = createClient(
  must("SUPABASE_URL", url),
  must("SUPABASE_SERVICE_ROLE(_KEY)", serviceKey),
  { auth: { autoRefreshToken: false, persistSession: false } }
);
