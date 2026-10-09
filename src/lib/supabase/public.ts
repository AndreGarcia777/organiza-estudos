import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/app-mode";
import type { Database } from "@/lib/supabase/database.types";

export function createPublicSupabase() {
  const config = supabaseConfig();
  if (!config) return null;
  // Always anonymous: public catalog does not inherit an administrator session.
  return createClient<Database>(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
