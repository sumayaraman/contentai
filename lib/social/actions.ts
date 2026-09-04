"use server";

import { revalidatePath } from "next/cache";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { requireWorkspaceRole } from "@/lib/workspace/authorization";
import { disconnectSocialAccount, getSocialAccounts, publishToSocialAccount } from "@/lib/social/service";
import type { Platform } from "@/types/database";

export async function listSocialAccounts() {
  const { workspaceId } = await getActiveWorkspace();
  return getSocialAccounts(workspaceId);
}

export async function disconnectAccount(accountId: string) {
  const { workspaceId } = await getActiveWorkspace();
  await requireWorkspaceRole(workspaceId, ["OWNER", "ADMIN"]);
  await disconnectSocialAccount(accountId, workspaceId);
  revalidatePath("/settings");
  return { ok: true };
}

export async function publishRealPost(input: { postId: string; accountId: string }) {
  const { supabase, workspaceId, userId, role } = await getActiveWorkspace();
  if (role === "MEMBER") return { ok: false, error: "Only workspace owners and admins can publish through connected social accounts." };

  const { data: post, error } = await supabase.from("posts")
    .select("id,title,caption,image_url,platform,status,workspace_id")
    .eq("id", input.postId).eq("workspace_id", workspaceId).maybeSingle();
  if (error || !post) return { ok: false, error: "Post not found in this workspace." };

  const { data: account } = await supabase.from("social_accounts")
    .select("id,platform").eq("id", input.accountId).eq("workspace_id", workspaceId).maybeSingle();
  if (!account) return { ok: false, error: "Social account not found in this workspace." };
  if ((account.platform as Platform) !== post.platform) return { ok: false, error: "The selected account does not match the post platform." };

  const { data: existing } = await supabase.from("post_publications").select("id,status").eq("post_id", post.id).eq("social_account_id", account.id).in("status", ["PUBLISHED","PUBLISHING"]).maybeSingle();
  if (existing) return { ok: false, error: "This post has already been published or is currently publishing to this account." };

  const { data: publication, error: insertError } = await supabase.from("post_publications").insert({
    workspace_id: workspaceId, post_id: post.id, social_account_id: account.id, platform: account.platform, status: "PUBLISHING", attempt_count: 1
  }).select("id").single();
  if (insertError || !publication) return { ok: false, error: insertError?.message || "Could not create publishing record." };

  const result = await publishToSocialAccount(account.id, workspaceId, {
    postId: post.id, title: post.title, caption: post.caption, imageUrl: post.image_url,
  });

  await supabase.from("post_publications").update({
    status: result.success ? "PUBLISHED" : "FAILED",
    external_post_id: result.externalPostId,
    published_at: result.success ? new Date().toISOString() : null,
    error_message: result.success ? null : result.message,
  }).eq("id", publication.id).eq("workspace_id", workspaceId);

  await supabase.from("publishing_events").insert({
    workspace_id: workspaceId, post_id: post.id, user_id: userId, platform: account.platform,
    action: "PUBLISH", status: result.success ? "SUCCESS" : "FAILED", external_post_id: result.externalPostId,
    message: result.message, error_code: result.errorCode ?? null,
  });

  if (result.success) {
    await supabase.from("posts").update({ status: "PUBLISHED", published_at: new Date().toISOString() }).eq("id", post.id).eq("workspace_id", workspaceId);
  } else {
    await supabase.from("posts").update({ status: "FAILED" }).eq("id", post.id).eq("workspace_id", workspaceId);
  }

  revalidatePath("/publishing"); revalidatePath("/posts"); revalidatePath("/calendar"); revalidatePath("/analytics"); revalidatePath(`/posts/${post.id}/edit`);
  return result.success ? { ok: true, message: result.message } : { ok: false, error: result.message, requiresReauth: result.requiresReauth };
}
