import { createBrowserClient } from "@supabase/ssr";
import { requirePublicEnv } from "@/lib/env";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = requirePublicEnv();
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
