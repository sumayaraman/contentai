"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { validatePostForm, normalizeText } from "@/lib/content/validation";
import { getSocialPublisher } from "@/lib/publishing";

function ensureSuccess(error: { message?: string } | null, fallback: string) {
  if (error) throw new Error(error?.message || fallback);
}

export async function createPost(formData: FormData) {
  const { supabase, userId, workspaceId } = await getActiveWorkspace();
  const { values, errors } = validatePostForm(formData);
  if (Object.keys(errors).length) return { ok: false, errors };

  const { data: createdPost, error } = await supabase.from("posts").insert({
    workspace_id: workspaceId,
    created_by: userId,
    title: values.title,
    caption: values.caption,
    platform: values.platform,
    status: values.status,
    category_id: values.categoryId || null,
    cta: values.cta,
    hashtags: values.hashtags,
    image_url: values.imageUrl,
    image_prompt: values.imagePrompt,
    scheduled_at: values.scheduledAt,
    published_at: values.status === "PUBLISHED" ? new Date().toISOString() : null,
  }).select("id").single();
  ensureSuccess(error, "Could not create the post.");

  if (values.status === "SCHEDULED" && createdPost) {
    const publisher = getSocialPublisher();
    const result = await publisher.schedulePost({
      postId: createdPost.id,
      platform: values.platform!,
      title: values.title,
      caption: values.caption,
      imageUrl: values.imageUrl,
      scheduledAt: values.scheduledAt!,
    });
    if (!result.success) {
      await supabase.from("posts").update({ status: "FAILED" }).eq("id", createdPost.id).eq("workspace_id", workspaceId);
      return { ok: false, errors: { form: result.message || "Could not schedule the post." } };
    }
  }

  revalidatePath("/posts");
  revalidatePath("/dashboard");
  redirect("/posts?saved=created");
}

export async function updatePost(formData: FormData) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const postId = normalizeText(formData.get("post_id"), 100);
  if (!postId) throw new Error("Post ID is required.");

  const { values, errors } = validatePostForm(formData);
  if (Object.keys(errors).length) return { ok: false, errors };

  const { data: existing, error: existingError } = await supabase
    .from("posts")
    .select("id, published_at")
    .eq("id", postId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  ensureSuccess(existingError, "Could not load the post.");
  if (!existing) return { ok: false, errors: { form: "Post not found in this workspace." } };

  if (values.status === "SCHEDULED") {
    const publisher = getSocialPublisher();
    const result = await publisher.schedulePost({
      postId: postId,
      platform: values.platform!,
      title: values.title,
      caption: values.caption,
      imageUrl: values.imageUrl,
      scheduledAt: values.scheduledAt!,
    });
    if (!result.success) return { ok: false, errors: { form: result.message || "Could not schedule the post." } };
  }

  const { error } = await supabase
    .from("posts")
    .update({
      title: values.title,
      caption: values.caption,
      platform: values.platform,
      status: values.status,
      category_id: values.categoryId || null,
      cta: values.cta,
      hashtags: values.hashtags,
      image_url: values.imageUrl,
      image_prompt: values.imagePrompt,
      scheduled_at: values.scheduledAt,
      published_at: values.status === "PUBLISHED" ? existing.published_at || new Date().toISOString() : null,
    })
    .eq("id", postId)
    .eq("workspace_id", workspaceId);
  ensureSuccess(error, "Could not update the post.");

  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}/edit`);
  revalidatePath("/dashboard");
  redirect("/posts?saved=updated");
}

export async function deletePost(formData: FormData) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const postId = normalizeText(formData.get("post_id"), 100);
  if (!postId) throw new Error("Post ID is required.");

  const { error } = await supabase.from("posts").delete().eq("id", postId).eq("workspace_id", workspaceId);
  ensureSuccess(error, "Could not delete the post.");

  revalidatePath("/posts");
  revalidatePath("/dashboard");
  redirect("/posts?saved=deleted");
}

export async function duplicatePost(formData: FormData) {
  const { supabase, userId, workspaceId } = await getActiveWorkspace();
  const postId = normalizeText(formData.get("post_id"), 100);
  if (!postId) throw new Error("Post ID is required.");

  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("title, caption, platform, category_id, cta, hashtags, image_url, image_prompt")
    .eq("id", postId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  ensureSuccess(fetchError, "Could not load the post.");
  if (!post) throw new Error("Post not found in this workspace.");

  const { error } = await supabase.from("posts").insert({
    workspace_id: workspaceId,
    created_by: userId,
    title: `${post.title} (Copy)`.slice(0, 200),
    caption: post.caption,
    platform: post.platform,
    status: "DRAFT",
    category_id: post.category_id,
    cta: post.cta,
    hashtags: post.hashtags,
    image_url: post.image_url,
    image_prompt: post.image_prompt,
    scheduled_at: null,
    published_at: null,
  });
  ensureSuccess(error, "Could not duplicate the post.");

  revalidatePath("/posts");
  revalidatePath("/dashboard");
  redirect("/posts?saved=duplicated");
}

export async function createCategory(formData: FormData) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const name = normalizeText(formData.get("name"), 80);
  const color = normalizeText(formData.get("color"), 7) || "#2563eb";
  if (!name) return { ok: false, error: "Category name is required." };
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return { ok: false, error: "Choose a valid color." };

  const { error } = await supabase.from("categories").insert({ workspace_id: workspaceId, name, color });
  if (error) return { ok: false, error: error.message.includes("unique") ? "That category already exists." : error.message };
  revalidatePath("/posts");
  revalidatePath("/posts/categories");
  return { ok: true };
}

export async function updateCategory(formData: FormData) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const id = normalizeText(formData.get("category_id"), 100);
  const name = normalizeText(formData.get("name"), 80);
  const color = normalizeText(formData.get("color"), 7) || "#2563eb";
  if (!id || !name) return { ok: false, error: "Category name is required." };
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return { ok: false, error: "Choose a valid color." };

  const { error } = await supabase.from("categories").update({ name, color }).eq("id", id).eq("workspace_id", workspaceId);
  if (error) return { ok: false, error: error.message.includes("unique") ? "That category already exists." : error.message };
  revalidatePath("/posts");
  revalidatePath("/posts/categories");
  return { ok: true };
}

export async function deleteCategory(formData: FormData) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const id = normalizeText(formData.get("category_id"), 100);
  if (!id) return { ok: false, error: "Category ID is required." };

  const { error } = await supabase.from("categories").delete().eq("id", id).eq("workspace_id", workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/posts");
  revalidatePath("/posts/categories");
  return { ok: true };
}

export async function attachMediaToPost(formData: FormData) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const postId = normalizeText(formData.get("post_id"), 100);
  const mediaId = normalizeText(formData.get("media_id"), 100);
  if (!postId || !mediaId) throw new Error("Post and media are required.");

  const { data: media, error: mediaError } = await supabase.from("media").select("url").eq("id", mediaId).eq("workspace_id", workspaceId).maybeSingle();
  ensureSuccess(mediaError, "Could not load media.");
  if (!media) throw new Error("Media not found in this workspace.");

  const { error } = await supabase.from("posts").update({ image_url: media.url }).eq("id", postId).eq("workspace_id", workspaceId);
  ensureSuccess(error, "Could not attach the image.");
  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}/edit`);
  return { ok: true };
}
