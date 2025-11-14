// lib/supabase/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Lazy-load environment variables safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Missing Supabase environment variables!");
}

let supabaseInstance: ReturnType<typeof createClient> | null = null;

// ✅ Export a function instead of creating immediately
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseInstance;
})();
