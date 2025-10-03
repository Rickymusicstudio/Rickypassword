// backend/server/supabase.js
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

let cached = null;

/** Returns a Supabase client, or null if env is missing. */
export function getSupa() {
  if (cached) return cached;

  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY, // preferred
    SUPABASE_SERVICE_ROLE,     // alias
    SUPABASE_ANON_KEY,         // last-resort (read-only)
  } = process.env;

  // Prefer service role (write access for tracking), else anon (read-only)
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE || SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !key) {
    console.warn("[supabase] Missing SUPABASE_URL or service role key. Views tracking disabled.");
    return null;
  }

  cached = createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
  return cached;
}
