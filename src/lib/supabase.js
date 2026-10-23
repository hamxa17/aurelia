import { createClient } from '@supabase/supabase-js';

// These come from .env.local (on your computer) and from Vercel's Environment Variables (live site).
// The anon key is designed to be public — the database rules in supabase/schema.sql are what keep data safe.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
