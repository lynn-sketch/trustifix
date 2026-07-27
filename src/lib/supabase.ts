import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/** True when Vite env has a Supabase project configured */
export const isSupabaseConfigured = Boolean(url && key);

export type Database = Record<string, unknown>;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY) to .env.local",
    );
  }
  if (!client) {
    client = createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

/** Safe accessor — returns null in local demo mode */
export function trySupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return getSupabase();
}
