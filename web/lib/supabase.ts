import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Security: Use environment variables instead of hardcoded values
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate at runtime - fail fast if misconfigured
// Moved inside function or lazily evaluated to avoid breaking build if unused
const validateConfig = () => {
  if (!url || !key) {
    if (typeof window === 'undefined') {
       // Allow missing keys during server-side build/static generation if not explicitly used
       console.warn("[Security] Missing Supabase environment variables during server-side execution.");
    } else {
        throw new Error(
          "[Security] Missing Supabase environment variables. " +
          "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
        );
    }
  }
};


let client: ReturnType<typeof createSupabaseClient> | undefined;

export function createClient() {
  if (client) return client;

  validateConfig();

  // Provide fallback empty strings to prevent crash during build if validation passed with warning
  client = createSupabaseClient(url || 'https://placeholder.supabase.co', key || 'placeholder-key', {
    auth: {
      persistSession: true,
      storageKey: 'vasta-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      detectSessionInUrl: false,
      flowType: 'pkce',
      autoRefreshToken: true,
    }
  });

  return client;
}
