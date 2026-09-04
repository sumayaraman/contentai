"use server";
import { revalidatePath } from "next/cache";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { getImageProvider } from "@/ai/image-index";
import { normalizeText } from "@/lib/content/validation";
const MAX_PROMPT = 4000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_FALLBACK_BYTES = 1 * 1024 * 1024;
async function resolveImage(url: string) {
  const match = url.match(/^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,([A-Za-z0-9+/=]+)$/);
  if (match) return { mimeType: match[1], bytes: Buffer.from(match[2], "base64") };
  return null;
}
export async function generateImage(formData: FormData) {
  await getActiveWorkspace();
  const prompt = normalizeText(formData.get("prompt"), MAX_PROMPT);
  const size = normalizeText(formData.get("size"), 20) as "1024x1024" | "1536x1024" | "1024x1536";
  if (!prompt) return { ok: false, error: "An image prompt is required." };
  if (!["1024x1024", "1536x1024", "1024x1536"].includes(size)) return { ok: false, error: "Choose a valid image size." };
  try { const provider = getImageProvider(); const image = await provider.generateImage({ prompt, size }); return { ok: true, image, demo: image.provider === "mock" }; }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : "Image generation failed." }; }
}
export async function saveGeneratedImage(formData: FormData) {
  const { supabase, userId, workspaceId } = await getActiveWorkspace();
  const imageUrl = normalizeText(formData.get("image_url"), 20_000);
  const prompt = normalizeText(formData.get("prompt"), MAX_PROMPT);
  const provider = normalizeText(formData.get("provider"), 50) || "mock";
  const model = normalizeText(formData.get("model"), 100) || null;
  if (!imageUrl) return { ok: false, error: "Image URL is required." };
  const parsed = await resolveImage(imageUrl);
  if (!parsed) return { ok: false, error: "The generated image data is invalid." };
  if (parsed.bytes.length === 0 || parsed.bytes.length > MAX_IMAGE_BYTES) return { ok: false, error: "Generated image is too large." };
  const extension = parsed.mimeType === "image/jpeg" ? "jpg" : parsed.mimeType === "image/svg+xml" ? "svg" : parsed.mimeType.split("/")[1];
  const mediaId = crypto.randomUUID();
  const objectPath = `${workspaceId}/generated/${mediaId}.${extension}`;
  const { error: storageError } = await supabase.storage.from("media").upload(objectPath, parsed.bytes, { contentType: parsed.mimeType, upsert: false });
  let url = imageUrl; let storagePath: string | null = null; let source: "DEMO_FALLBACK" | "AI_GENERATED" = "DEMO_FALLBACK";
  if (!storageError) { storagePath = objectPath; source = "AI_GENERATED"; url = `/api/media/${mediaId}`; }
  else if (parsed.bytes.length > MAX_FALLBACK_BYTES) return { ok: false, error: "Storage is unavailable; demo fallback supports generated images up to 1 MB." };
  const { data, error } = await supabase.from("media").insert({ id: mediaId, workspace_id: workspaceId, uploaded_by: userId, file_name: `ai-${crypto.randomUUID()}.${extension}`, mime_type: parsed.mimeType, file_size: parsed.bytes.length, storage_path: storagePath, url, source, generation_prompt: prompt, generation_provider: provider, generation_model: model }).select("id, workspace_id, uploaded_by, file_name, mime_type, file_size, storage_path, url, source, generation_prompt, generation_provider, generation_model, created_at").single();
  if (error) { if (storagePath) await supabase.storage.from("media").remove([storagePath]); return { ok: false, error: error.message }; }
  revalidatePath("/media-library"); return { ok: true, media: data };
}
export async function attachGeneratedImageToPost(formData: FormData) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const postId = normalizeText(formData.get("post_id"), 100); const mediaId = normalizeText(formData.get("media_id"), 100);
  if (!postId || !mediaId) return { ok: false, error: "Post and image are required." };
  const { data: media } = await supabase.from("media").select("url").eq("id", mediaId).eq("workspace_id", workspaceId).maybeSingle();
  if (!media) return { ok: false, error: "Image not found in this workspace." };
  const { error } = await supabase.from("posts").update({ image_url: media.url }).eq("id", postId).eq("workspace_id", workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/posts/${postId}/edit`); revalidatePath("/posts"); return { ok: true };
}
