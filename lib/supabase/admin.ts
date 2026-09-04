import { createClient } from "@supabase/supabase-js";
import { requirePublicEnv } from "@/lib/env";

export function createAdminClient() {
  const { supabaseUrl } = requirePublicEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side publishing jobs.");
  return createClient(supabaseUrl, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
