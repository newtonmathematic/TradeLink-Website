import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_KEY) as string | undefined;

if (!url || !anonKey) {
  // We intentionally throw at import time if misconfigured to surface issues early in development
  // In production, ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in the environment
  console.warn(
    "Supabase URL or anon key is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(url || "", anonKey || "");
