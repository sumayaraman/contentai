export function requirePublicEnv() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "";

  if (!supabaseUrl || !supabasePublishableKey) {
    if (typeof window === "undefined") {
      console.warn("Missing Supabase URL or Publishable/Anon Key in environment variables.");
    }
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
