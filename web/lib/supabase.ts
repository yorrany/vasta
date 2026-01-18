import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = "https://pmecrhlmynkpptpjiuhx.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZWNyaGxteW5rcHB0cGppdWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NTMwMjYsImV4cCI6MjA4NDAyOTAyNn0._mRzOK8UX1y5wccNNucvztJtlT0c0cMirwhGWEJvlDs";

  return createBrowserClient(url, key);
}
