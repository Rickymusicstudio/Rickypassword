// src/lib/supabase.js — browser Supabase client (null when env vars are not set,
// in which case the site falls back to the built-in data in src/data/*.js)
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const MEDIA_BUCKET = 'media'
