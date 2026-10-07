import { createClient } from "@/lib/supabase/server";
import { getAdminClientOrNull } from "@/lib/supabase/admin";
import { requirePublicEnv } from "@/lib/env";
import type { UserProfile } from "@/types/database";

export async function getCurrentUser() {
  const { supabaseUrl, supabasePublishableKey } = requirePublicEnv();

  // If Supabase credentials are missing or invalid, fallback to Demo Mode user
  if (!supabaseUrl || !supabasePublishableKey || !supabaseUrl.startsWith("http")) {
    const demoProfile: UserProfile = {
      id: "e0000000-0000-4000-8000-000000000000",
      email: "demo@contentai.dev",
      name: "Demo Creator",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return {
      authUser: {
        id: "e0000000-0000-4000-8000-000000000000",
        email: "demo@contentai.dev",
        user_metadata: { name: "Demo Creator" },
      } as any,
      profile: demoProfile,
      supabase: null as any,
    };
  }

  const supabase = await createClient();
  let user: any = null;
  try {
    const res = await Promise.race([
      supabase.auth.getUser(),
      new Promise<{ data: { user: null }; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: { user: null }, error: new Error("Auth timeout") }), 2500)
      ),
    ]);
    user = res.data?.user;
  } catch (err) {
    console.warn("getCurrentUser auth error:", err);
  }

  if (!user) {
    const fallbackProfile: UserProfile = {
      id: "e0000000-0000-4000-8000-000000000000",
      email: "guest@contentai.dev",
      name: "Creator",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return {
      authUser: {
        id: "e0000000-0000-4000-8000-000000000000",
        email: "guest@contentai.dev",
        user_metadata: { name: "Creator" },
      } as any,
      profile: fallbackProfile,
      supabase,
    };
  }

  let profile: UserProfile | null = null;
  try {
    const { data: dbProfile } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();
    profile = dbProfile as UserProfile | null;
  } catch (err) {
    console.warn("Failed to fetch profile from users table:", err);
  }

  if (!profile) {
    const email = user.email ?? "";
    const name =
      (user.user_metadata?.name as string | undefined) ||
      (user.user_metadata?.full_name as string | undefined) ||
      (email ? email.split("@")[0] : "User");

    const admin = getAdminClientOrNull();
    const clientToUse = admin || supabase;
    try {
      const { data: createdProfile } = await clientToUse
        .from("users")
        .upsert(
          { id: user.id, email, name },
          { onConflict: "id" }
        )
        .select("id, email, name, avatar_url, created_at, updated_at")
        .maybeSingle();
      if (createdProfile) profile = createdProfile as UserProfile;
    } catch {}

    if (!profile) {
      profile = {
        id: user.id,
        email,
        name,
        avatar_url: (user.user_metadata?.avatar_url as string | undefined) || null,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }

  return { authUser: user, profile, supabase };
}
