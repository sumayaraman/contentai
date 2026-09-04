"use server";

import { getActiveWorkspace } from "@/lib/content/workspace";
import { scoreContent } from "@/lib/intelligence/service";
import { revalidatePath } from "next/cache";

export async function scorePostContent(formData: FormData) {
  const postId = String(formData.get("post_id") || "").trim();
  const targetAudience = String(formData.get("target_audience") || "").trim();
  if (!postId) return { ok: false as const, error: "Choose a post to score." };
  if (!targetAudience || targetAudience.length > 300) return { ok: false as const, error: "Enter a target audience (300 characters or fewer)." };

  const { supabase, userId, workspaceId } = await getActiveWorkspace();
  const { data: post, error } = await supabase.from("posts").select("id, title, caption, cta, hashtags, platform").eq("id", postId).eq("workspace_id", workspaceId).maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  if (!post) return { ok: false as const, error: "Post not found in this workspace." };

  try {
    const result = await scoreContent({ hook: post.title, caption: post.caption || "", cta: post.cta || "", hashtags: post.hashtags || "", platform: post.platform, targetAudience });
    await supabase.from("ai_generations").insert({ workspace_id: workspaceId, user_id: userId, generation_type: "CONTENT_SCORE", input: JSON.stringify({ postId, targetAudience }), output: JSON.stringify(result.score), provider: result.provider });
    revalidatePath("/analytics");
    return { ok: true as const, ...result };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Content scoring failed." };
  }
}
