"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile({ name, avatarUrl }: { name: string; avatarUrl: string }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "You must be signed in." };

  const cleanName = name.trim().slice(0, 80);
  const cleanAvatar = avatarUrl.trim().slice(0, 500) || null;
  if (cleanAvatar && !/^https?:\/\//i.test(cleanAvatar)) return { error: "Avatar must be an http(s) URL." };
  const { error } = await supabase.from("users").update({ name: cleanName || null, avatar_url: cleanAvatar }).eq("id", data.user.id);
  if (error) { console.error("Profile update failed:", error.message); return { error: "Could not update your profile. Please try again." }; }
  return { error: null };
}
