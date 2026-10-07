import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminClientOrNull } from "@/lib/supabase/admin";
import type { UserProfile } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) redirect("/login");

  let profile: UserProfile | null = null;
  try {
    const { data: dbProfile } = await supabase
      .from("users")
      .select("id, email, name, avatar_url, created_at, updated_at")
      .eq("id", data.user.id)
      .maybeSingle();
    profile = dbProfile as UserProfile | null;
  } catch (err) {
    console.warn("Failed to fetch profile from users table:", err);
  }

  if (!profile) {
    const email = data.user.email ?? "";
    const name =
      (data.user.user_metadata?.name as string | undefined) ||
      (data.user.user_metadata?.full_name as string | undefined) ||
      (email ? email.split("@")[0] : "User");

    const admin = getAdminClientOrNull();
    const clientToUse = admin || supabase;
    try {
      const { data: createdProfile } = await clientToUse
        .from("users")
        .upsert(
          { id: data.user.id, email, name },
          { onConflict: "id" }
        )
        .select("id, email, name, avatar_url, created_at, updated_at")
        .maybeSingle();
      if (createdProfile) profile = createdProfile as UserProfile;
    } catch {}

    if (!profile) {
      profile = {
        id: data.user.id,
        email,
        name,
        avatar_url: (data.user.user_metadata?.avatar_url as string | undefined) || null,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }

  return { authUser: data.user, profile, supabase };
}
