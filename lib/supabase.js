import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);

// Customer login for the store (sign up, account, cart).
export const supabase = supabaseConfigured ? createClient(url, key) : null;

// Separate login for /admin, saved under a different name in the browser,
// so signing in to the admin panel does not sign you in to the store (and the other way round).
export const adminSupabase = supabaseConfigured
  ? createClient(url, key, { auth: { storageKey: 'marjan-admin-auth' } })
  : null;

export const IMAGE_BUCKET = 'product-images';
