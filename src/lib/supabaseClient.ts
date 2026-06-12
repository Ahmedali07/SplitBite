/**
 * Browser Supabase client singleton.
 * Lazy-initialized so `next build` does not require env vars at import time.
 */
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

let client: Client | undefined;

function getClient(): Client {
  if (!client) client = createClient();
  return client;
}

export const supabase = new Proxy({} as Client, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getClient() as object, prop, receiver);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(getClient());
    }
    return value;
  },
});
