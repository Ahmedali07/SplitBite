/**
 * Browser Supabase client singleton.
 * Uses @supabase/ssr so auth sessions persist in cookies via middleware.
 */
import { createClient } from "@/lib/supabase/client";

export const supabase = createClient();
