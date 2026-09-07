"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspaceRole } from "@/lib/workspace/authorization";

const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function updateBrandSettings(workspaceId: string, input: {
  brandName: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  voice: string;
}) {
  const { supabase } = await requireWorkspaceRole(workspaceId, ["OWNER", "ADMIN"]);
  const brandName = clean(input.brandName, 120);
  const description = clean(input.description, 1000);
  const voice = clean(input.voice, 500);
  const primaryColor = clean(input.primaryColor, 7) || "#111827";
  const secondaryColor = clean(input.secondaryColor, 7) || "#f59e0b";
  if (!/^#[0-9A-Fa-f]{6}$/.test(primaryColor) || !/^#[0-9A-Fa-f]{6}$/.test(secondaryColor)) {
    return { ok: false as const, error: "Brand colors must be valid 6-digit hex colors." };
  }
  const { error } = await supabase.from("workspaces").update({
    brand_name: brandName || null,
    brand_description: description || null,
    brand_primary_color: primaryColor,
    brand_secondary_color: secondaryColor,
    brand_voice: voice || null,
  }).eq("id", workspaceId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/workspace");
  revalidatePath("/settings");
  return { ok: true as const };
}

export async function uploadBrandLogo(workspaceId: string, dataUrl: string) {
  const { supabase, userId } = await requireWorkspaceRole(workspaceId, ["OWNER", "ADMIN"]);
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return { ok: false as const, error: "Please choose a PNG, JPG, WEBP, GIF or SVG logo." };
  const mimeType = match[1];
  if (!ALLOWED_LOGO_TYPES.has(mimeType)) return { ok: false as const, error: "Unsupported logo format." };
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_LOGO_BYTES) return { ok: false as const, error: "Logo must be smaller than 5 MB." };

  const id = crypto.randomUUID();
  const ext = mimeType === "image/svg+xml" ? "svg" : mimeType.split("/")[1];
  const storagePath = `${workspaceId}/brand/logo-${id}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("media").upload(storagePath, bytes, { contentType: mimeType, upsert: false });
  if (uploadError) return { ok: false as const, error: `Could not upload logo: ${uploadError.message}` };

  const mediaId = crypto.randomUUID();
  const { error: mediaError } = await supabase.from("media").insert({
    id: mediaId,
    workspace_id: workspaceId,
    uploaded_by: userId,
    file_name: `brand-logo.${ext}`,
    mime_type: mimeType,
    file_size: bytes.length,
    storage_path: storagePath,
    url: `/api/media/${mediaId}`,
    source: "UPLOAD",
  });
  if (mediaError) {
    await supabase.storage.from("media").remove([storagePath]);
    return { ok: false as const, error: mediaError.message };
  }

  const { error: workspaceError } = await supabase.from("workspaces").update({ brand_logo_url: `/api/media/${mediaId}` }).eq("id", workspaceId);
  if (workspaceError) return { ok: false as const, error: workspaceError.message };
  revalidatePath("/workspace");
  revalidatePath("/settings");
  return { ok: true as const, url: `/api/media/${mediaId}` };
}
