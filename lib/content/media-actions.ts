"use server";

import { revalidatePath } from "next/cache";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { normalizeText } from "@/lib/content/validation";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_FALLBACK_BYTES = 1 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function uploadMedia(formData: FormData) {
  const { supabase, userId, workspaceId } = await getActiveWorkspace();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image to upload." };
  if (!ALLOWED_TYPES.has(file.type)) return { ok: false, error: "Only JPG, PNG, WebP, and GIF images are supported." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };

  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const objectPath = `${workspaceId}/${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();

  const { error: storageError } = await supabase.storage.from("media").upload(objectPath, bytes, {
    contentType: file.type,
    upsert: false,
  });

  const mediaId = crypto.randomUUID();
  let url: string;
  let storagePath: string | null = objectPath;
  let storageBacked = true;

  if (storageError) {
    if (file.size > MAX_FALLBACK_BYTES) return { ok: false, error: "Storage is unavailable; demo fallback supports images up to 1 MB." };
    // Graceful demo fallback when the Supabase Storage bucket is not configured.
    // The image is stored as a bounded data URL so the Media Library remains usable.
    const base64 = Buffer.from(bytes).toString("base64");
    url = `data:${file.type};base64,${base64}`;
    storagePath = null;
    storageBacked = false;
  } else {
    url = `/api/media/${mediaId}`;
  }

  const { error: dbError } = await supabase.from("media").insert({
    id: mediaId,
    workspace_id: workspaceId,
    uploaded_by: userId,
    file_name: file.name.slice(0, 255),
    mime_type: file.type,
    file_size: file.size,
    storage_path: storagePath,
    url,
    source: storageBacked ? "UPLOAD" : "DEMO_FALLBACK",
    generation_prompt: null,
    generation_provider: null,
    generation_model: null,
  });

  if (dbError) {
    if (storageBacked) await supabase.storage.from("media").remove([objectPath]);
    return { ok: false, error: dbError.message };
  }

  revalidatePath("/media-library");
  return { ok: true, storageBacked };
}

export async function deleteMedia(formData: FormData) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const id = normalizeText(formData.get("media_id"), 100);
  if (!id) return { ok: false, error: "Media ID is required." };

  const { data: media, error: fetchError } = await supabase.from("media").select("storage_path").eq("id", id).eq("workspace_id", workspaceId).maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!media) return { ok: false, error: "Media not found." };

  if (media.storage_path) {
    const { error: storageError } = await supabase.storage.from("media").remove([media.storage_path]);
    if (storageError) return { ok: false, error: storageError.message };
  }

  const { error } = await supabase.from("media").delete().eq("id", id).eq("workspace_id", workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/media-library");
  revalidatePath("/posts");
  return { ok: true };
}
