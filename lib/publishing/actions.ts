"use server";

import { revalidatePath } from "next/cache";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { getSocialPublisher } from "@/lib/publishing";
import { normalizeText } from "@/lib/content/validation";
import type { Platform } from "@/types/database";
import type { PublishSimulationMode } from "@/lib/publishing/types";

const platforms = new Set<Platform>(["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"]);

function revalidatePublishing(postId: string) {
  revalidatePath("/publishing");
  revalidatePath("/calendar");
  revalidatePath("/posts");
  revalidatePath(`/posts/${postId}/edit`);
  revalidatePath("/analytics");
  revalidatePath("/dashboard");
}

async function getPost(postId: string) {
  const { supabase, userId, workspaceId } = await getActiveWorkspace();
  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, caption, image_url, platform, status, scheduled_at, published_at")
    .eq("id", postId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!post) throw new Error("Post not found in this workspace.");
  return { supabase, userId, workspaceId, post };
}

function parseMode(formData: FormData): PublishSimulationMode {
  return formData.get("simulation_mode") === "FAILURE" ? "FAILURE" : "SUCCESS";
}

export async function simulatePublish(formData: FormData) {
  const postId = normalizeText(formData.get("post_id"), 100);
  if (!postId) return { ok: false, error: "Post ID is required." };

  const { supabase, userId, workspaceId, post } = await getPost(postId);
  if (!platforms.has(post.platform as Platform)) return { ok: false, error: "Unsupported platform." };
  if (post.status !== "SCHEDULED" && post.status !== "FAILED") {
    return { ok: false, error: "Only scheduled or failed posts can be published by the simulator." };
  }

  const mode = parseMode(formData);
  const publisher = getSocialPublisher();
  const result = await publisher.publishPost({
    postId: post.id,
    platform: post.platform as Platform,
    title: post.title,
    caption: post.caption,
    imageUrl: post.image_url,
    simulationMode: mode,
  });

  await supabase.from("publishing_events").insert({
    workspace_id: workspaceId,
    post_id: post.id,
    user_id: userId,
    platform: post.platform,
    action: "PUBLISH",
    status: result.success ? "SUCCESS" : "FAILED",
    external_post_id: result.externalPostId,
    message: result.message ?? null,
    error_code: result.errorCode ?? null,
  });

  if (!result.success) {
    await supabase.from("posts").update({ status: "FAILED" }).eq("id", post.id).eq("workspace_id", workspaceId);
    revalidatePublishing(post.id);
    return { ok: false, error: result.message || "Publishing failed." };
  }

  const publishedAt = new Date().toISOString();
  const { error: postError } = await supabase
    .from("posts")
    .update({ status: "PUBLISHED", published_at: publishedAt })
    .eq("id", post.id)
    .eq("workspace_id", workspaceId);
  if (postError) return { ok: false, error: postError.message };

  const metrics = createDemoAnalytics(post.id, post.platform as Platform);
  const { error: analyticsError } = await supabase.from("analytics").insert({
    post_id: post.id,
    platform: post.platform,
    ...metrics,
    recorded_at: publishedAt,
  });
  if (analyticsError) {
    // Publishing remains successful even if demo analytics persistence is unavailable.
    console.warn("Demo analytics could not be recorded:", analyticsError.message);
  }

  revalidatePublishing(post.id);
  return { ok: true, message: `Published ${post.platform === "X" ? "to X" : `to ${post.platform.charAt(0) + post.platform.slice(1).toLowerCase()}`} in demo mode.` };
}

function createDemoAnalytics(postId: string, platform: Platform) {
  let hash = 0;
  for (const char of postId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const platformFactor = { INSTAGRAM: 1.15, FACEBOOK: 0.9, LINKEDIN: 1.05, X: 0.82 }[platform];
  const reach = Math.max(250, Math.round((900 + (hash % 5200)) * platformFactor));
  const likes = Math.round(reach * (0.035 + (hash % 18) / 1000));
  const comments = Math.round(reach * (0.004 + (hash % 7) / 1000));
  const shares = Math.round(reach * (0.003 + (hash % 6) / 1000));
  const impressions = Math.round(reach * (1.15 + (hash % 75) / 100));
  const engagementRate = Number((((likes + comments + shares) / reach) * 100).toFixed(2));
  return { likes, comments, shares, reach, impressions, engagement_rate: engagementRate };
}

export async function retryPublish(formData: FormData) {
  formData.set("simulation_mode", "SUCCESS");
  return simulatePublish(formData);
}
