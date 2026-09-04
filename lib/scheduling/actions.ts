"use server";

import { revalidatePath } from "next/cache";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { getSocialPublisher } from "@/lib/publishing";
import { parseFutureSchedule } from "@/lib/scheduling/validation";
import { normalizeText } from "@/lib/content/validation";
import type { Platform } from "@/types/database";

function ensureSuccess(error: { message?: string } | null, fallback: string) {
  if (error) throw new Error(error?.message || fallback);
}

async function getWorkspacePost(postId: string) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, caption, image_url, platform, status, scheduled_at, published_at")
    .eq("id", postId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  ensureSuccess(error, "Could not load the post.");
  if (!post) throw new Error("Post not found in this workspace.");
  return { supabase, workspaceId, post };
}

function revalidateCalendar(postId?: string) {
  revalidatePath("/calendar");
  revalidatePath("/posts");
  revalidatePath("/dashboard");
  if (postId) revalidatePath(`/posts/${postId}/edit`);
}

export async function reschedulePost(formData: FormData) {
  const postId = normalizeText(formData.get("post_id"), 100);
  const scheduledAtRaw = normalizeText(formData.get("scheduled_at"), 100);
  if (!postId) return { ok: false, error: "Post ID is required." };

  const schedule = parseFutureSchedule(scheduledAtRaw);
  if (schedule.error) return { ok: false, error: schedule.error };

  const { supabase, workspaceId, post } = await getWorkspacePost(postId);
  if (post.status !== "SCHEDULED") {
    return { ok: false, error: "Only scheduled posts can be rescheduled from the calendar." };
  }

  const publisher = getSocialPublisher();
  const result = await publisher.schedulePost({
    postId: post.id,
    platform: post.platform as Platform,
    title: post.title,
    caption: post.caption,
    imageUrl: post.image_url,
    scheduledAt: schedule.value as string,
  });

  if (!result.success) return { ok: false, error: result.message || "Could not reschedule the post." };

  const { error } = await supabase
    .from("posts")
    .update({ scheduled_at: schedule.value, status: "SCHEDULED", published_at: null })
    .eq("id", postId)
    .eq("workspace_id", workspaceId);
  ensureSuccess(error, "Could not save the new schedule.");

  await supabase.from("publishing_events").insert({
    workspace_id: workspaceId,
    post_id: post.id,
    user_id: (await supabase.auth.getUser()).data.user?.id ?? "",
    platform: post.platform,
    action: "SCHEDULE",
    status: "SUCCESS",
    external_post_id: result.externalPostId,
    message: result.message ?? "Post scheduled in demo mode.",
  });

  revalidateCalendar(postId);
  return { ok: true, message: "Post rescheduled successfully." };
}

export async function simulatePublishPost(formData: FormData) {
  const postId = normalizeText(formData.get("post_id"), 100);
  if (!postId) return { ok: false, error: "Post ID is required." };

  const { supabase, workspaceId, post } = await getWorkspacePost(postId);
  if (post.status !== "SCHEDULED") {
    return { ok: false, error: "Only scheduled posts can be published from the simulator." };
  }

  const publisher = getSocialPublisher();
  const result = await publisher.publishPost({
    postId: post.id,
    platform: post.platform as Platform,
    title: post.title,
    caption: post.caption,
    imageUrl: post.image_url,
  });

  if (!result.success) return { ok: false, error: result.message || "Could not publish the post." };

  const { error } = await supabase
    .from("posts")
    .update({ status: "PUBLISHED", published_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("workspace_id", workspaceId);
  ensureSuccess(error, "Could not mark the post as published.");

  revalidateCalendar(postId);
  return { ok: true, message: "Post published in demo mode." };
}
