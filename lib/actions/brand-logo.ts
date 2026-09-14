"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type LogoPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export async function saveBrandLogo(
  workspaceId: string,
  logoMediaId: string | null,
  position: LogoPosition = "bottom-right"
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!member) return { error: "Not a member of this workspace" };

  const { error } = await supabase
    .from("workspaces")
    .update({
      brand_logo_media_id: logoMediaId,
      brand_logo_position: position,
    })
    .eq("id", workspaceId);

  if (error) return { error: error.message };

  revalidatePath(`/workspace/${workspaceId}`);
  return { success: true };
}

export async function getBrandSettings(workspaceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workspaces")
    .select(`
      brand_logo_media_id,
      brand_logo_position,
      media:brand_logo_media_id (
        id,
        file_name,
        storage_path,
        mime_type
      )
    `)
    .eq("id", workspaceId)
    .single();

  if (error) return null;
  return data;
}
