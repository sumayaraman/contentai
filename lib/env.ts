const requiredPublicEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export function requirePublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    console.error("Missing Supabase env vars");
    return {
      supabaseUrl: supabaseUrl || "",
      supabasePublishableKey: supabasePublishableKey || "",
    };
  }

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}
