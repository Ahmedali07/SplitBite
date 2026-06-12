import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

function requireSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel Project Settings → Environment Variables."
    );
  }

  return { url, key };
}

export function createClient() {
  if (browserClient) return browserClient;

  const { url, key } = requireSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, key);
  return browserClient;
}
