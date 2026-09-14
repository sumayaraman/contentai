"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspaceRole } from "@/lib/workspace/authorization";
import { createAdminClient } from "@/lib/supabase/admin";

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
  logoUrl?: string | null;
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

  const updateData: Record<string, unknown> = {
    brand_name: brandName || null,
    brand_description: description || null,
    brand_primary_color: primaryColor,
    brand_secondary_color: secondaryColor,
    brand_voice: voice || null,
  };
  if (input.logoUrl !== undefined) {
    updateData.brand_logo_url = input.logoUrl || null;
  }

  const { error } = await supabase.from("workspaces").update(updateData).eq("id", workspaceId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/workspace");
  revalidatePath("/settings");
  return { ok: true as const };
}

export async function uploadBrandLogo(workspaceId: string, dataUrl: string) {
  const { userId } = await requireWorkspaceRole(workspaceId, ["OWNER", "ADMIN"]);
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return { ok: false as const, error: "Please choose a PNG, JPG, WEBP, GIF or SVG logo." };
  const mimeType = match[1];
  if (!ALLOWED_LOGO_TYPES.has(mimeType)) return { ok: false as const, error: "Unsupported logo format." };
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > MAX_LOGO_BYTES) return { ok: false as const, error: "Logo must be smaller than 5 MB." };

  const admin = createAdminClient();
  const id = crypto.randomUUID();
  const ext = mimeType === "image/svg+xml" ? "svg" : mimeType.split("/")[1];
  const storagePath = `${workspaceId}/brand/logo-${id}.${ext}`;

  // Try public brand-assets bucket first
  let logoUrl = "";
  const { error: brandAssetError } = await admin.storage.from("brand-assets").upload(storagePath, bytes, { contentType: mimeType, upsert: true });
  if (!brandAssetError) {
    const { data: publicData } = admin.storage.from("brand-assets").getPublicUrl(storagePath);
    logoUrl = publicData.publicUrl;
  } else {
    // Fallback to media bucket
    const { error: mediaStorageError } = await admin.storage.from("media").upload(storagePath, bytes, { contentType: mimeType, upsert: true });
    if (mediaStorageError) {
      // In-memory fallback if storage is completely unavailable
      logoUrl = dataUrl;
    } else {
      logoUrl = `/api/media/${id}`;
    }
  }

  // Insert into media catalog
  await admin.from("media").insert({
    id,
    workspace_id: workspaceId,
    uploaded_by: userId,
    file_name: `brand-logo.${ext}`,
    mime_type: mimeType,
    file_size: bytes.length,
    storage_path: storagePath,
    url: logoUrl,
    source: "UPLOAD",
  });

  const { error: workspaceError } = await admin.from("workspaces").update({ brand_logo_url: logoUrl }).eq("id", workspaceId);
  if (workspaceError) return { ok: false as const, error: workspaceError.message };

  revalidatePath("/workspace");
  revalidatePath("/settings");
  return { ok: true as const, url: logoUrl };
}
