"use server";

import { getActiveWorkspace } from "@/lib/content/workspace";

export async function updateBrandSettings(
  workspaceId: string,
  input: {
    brandName: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    voice: string;
  }
) {
  const { supabase, workspaceId: activeId } = await getActiveWorkspace();
  if (workspaceId !== activeId) return { ok: false as const, error: "Unauthorized." };
  const { error } = await supabase
    .from("workspaces")
    .update({
      brand_name: input.brandName.trim().slice(0, 200),
      brand_description: input.description.trim().slice(0, 1000),
      brand_primary_color: input.primaryColor,
      brand_secondary_color: input.secondaryColor,
      brand_voice: input.voice.trim().slice(0, 300),
      updated_at: new Date().toISOString(),
    })
    .eq("id", workspaceId);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function uploadBrandLogo(workspaceId: string, dataUrl: string) {
  const { supabase, workspaceId: activeId } = await getActiveWorkspace();
  if (workspaceId !== activeId) return { ok: false as const, error: "Unauthorized.", url: "" };
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { ok: false as const, error: "Invalid image data.", url: "" };
  const mimeType = match[1];
  const base64 = match[2];
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
  const path = `${workspaceId}/logo-${Date.now()}.${ext}`;
  const buffer = Buffer.from(base64, "base64");
  const { error: uploadError } = await supabase.storage
    .from("brand-assets")
    .upload(path, buffer, { contentType: mimeType, upsert: true });
  if (uploadError) return { ok: false as const, error: uploadError.message, url: "" };
  const { data } = supabase.storage.from("brand-assets").getPublicUrl(path);
  const { error: dbError } = await supabase
    .from("workspaces")
    .update({ brand_logo_url: data.publicUrl, updated_at: new Date().toISOString() })
    .eq("id", workspaceId);
  if (dbError) return { ok: false as const, error: dbError.message, url: "" };
  return { ok: true as const, url: data.publicUrl };
}
