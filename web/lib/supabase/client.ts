
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (typeof window === 'undefined') {
       // Allow build to pass for SSG/Pre-rendering
       return createBrowserClient('https://placeholder.supabase.co', 'placeholder');
    }
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(url, key);
}
