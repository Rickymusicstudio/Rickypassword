import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Anon client (safe for read-only/public)
export const supabaseAnon = createClient(url, anon, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Service client (for admin/backend use, bypasses RLS)
export const supabaseService = createClient(url, service, {
  auth: { autoRefreshToken: false, persistSession: false },
});
