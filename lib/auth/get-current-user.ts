import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name, avatar_url, created_at, updated_at")
    .eq("id", data.user.id)
    .maybeSingle();

  return { authUser: data.user, profile: profile as UserProfile | null, supabase };
}
