"use server";

import { getActiveWorkspace } from "@/lib/content/workspace";
import { scoreContent } from "@/lib/intelligence/service";
import { revalidatePath } from "next/cache";

const DEMO_POSTS_MAP: Record<string, { title: string; caption: string; cta: string; hashtags: string; platform: import("@/types/database").Platform }> = {
  "demo-post-1": {
    title: "5 AI Content Automation Strategies for 2025",
    caption: "Scaling organic content across multiple channels shouldn't take 40 hours a week. Here is the framework high-growth teams use to generate, refine, and schedule brand-aligned posts in minutes.",
    cta: "Save this framework and drop your favorite AI tool in the comments 👇",
    hashtags: "#ContentMarketing #AIAutomation #Productivity #SaaS",
    platform: "LINKEDIN",
  },
  "demo-post-2": {
    title: "Behind the Scenes: How our creative team crafts viral hooks",
    caption: "The first 3 seconds of any post determine 80% of its reach. Stop starting with generic introductions and start opening with high-contrast statements.",
    cta: "Which hook style works best for your audience? Let us know below.",
    hashtags: "#CreatorEconomy #MarketingTips #SocialStrategy #GrowthHacking",
    platform: "INSTAGRAM",
  },
  "demo-post-3": {
    title: "Product Launch Spotlight: Next-Gen AI Visual Studio",
    caption: "Introducing our brand-new visual rendering studio: generate high-definition marketing mockups, brand-aware color palettes, and multi-ratio visuals in seconds.",
    cta: "Try it out free in your ContentAI workspace today — link in bio.",
    hashtags: "#ProductLaunch #TechNews #VisualDesign #AIArt",
    platform: "X",
  },
  "demo-post-4": {
    title: "Weekend Community Spotlight & Founder AMA",
    caption: "We are answering all your questions about modern marketing automation, workflow delegation, and brand growth this weekend. Drop your questions in the thread!",
    cta: "Join the conversation in the comments below!",
    hashtags: "#CommunityFirst #FounderStory #MarketingTalk",
    platform: "FACEBOOK",
  },
  "demo-post-5": {
    title: "The 3 Pillars of Multi-Channel Content Repurposing",
    caption: "One idea should become 5 distinct assets. Turn a long-form article into a LinkedIn carousel, 3 short tweets, an Instagram infographic, and a Facebook summary.",
    cta: "Click the link to read the full case study.",
    hashtags: "#ContentRepurposing #GrowthFramework #SaaSMarketing",
    platform: "LINKEDIN",
  },
  "demo-post-6": {
    title: "Visual Storytelling Breakdown: Lighting & Composition",
    caption: "Notice how studio-grade contrast and minimalist framing increase tap-through rates by up to 34% on social feeds.",
    cta: "Double tap if you agree with this design trend!",
    hashtags: "#VisualDesign #AestheticFeed #BrandIdentity",
    platform: "INSTAGRAM",
  },
  "demo-post-7": {
    title: "Why AI-Assisted Scheduling Beats Manual Dispatches",
    caption: "Timing is everything. Discover how automated queue dispatching tests optimal posting windows across multiple timezones.",
    cta: "Retweet to share with your fellow creators.",
    hashtags: "#SocialAutomation #GrowthTips #ProductivityTools",
    platform: "X",
  },
  "demo-post-8": {
    title: "Customer Story: How one agency cut publishing time by 75%",
    caption: "See how modern marketing teams use ContentAI to draft, collaborate, and approve multi-day campaigns without spreadsheets.",
    cta: "Read the full case study on our blog.",
    hashtags: "#AgencyGrowth #CaseStudy #MarketingTools",
    platform: "FACEBOOK",
  },
};

interface ScorePostData {
  id: string;
  title: string;
  caption: string | null;
  cta: string | null;
  hashtags: string | null;
  platform: import("@/types/database").Platform;
}

export async function scorePostContent(formData: FormData) {
  const postId = String(formData.get("post_id") || "").trim();
  const targetAudience = String(formData.get("target_audience") || "").trim();
  if (!postId) return { ok: false as const, error: "Choose a post to score." };
  if (!targetAudience || targetAudience.length > 300) return { ok: false as const, error: "Enter a target audience (300 characters or fewer)." };

  let targetPost: ScorePostData | null = null;
  let workspaceId = "";
  let userId = "";

  try {
    const active = await getActiveWorkspace();
    workspaceId = active.workspaceId;
    userId = active.userId;
    const { data: post } = await active.supabase.from("posts").select("id, title, caption, cta, hashtags, platform").eq("id", postId).eq("workspace_id", workspaceId).maybeSingle();
    if (post) targetPost = post as ScorePostData;
  } catch {}

  if (!targetPost && DEMO_POSTS_MAP[postId]) {
    targetPost = {
      id: postId,
      title: DEMO_POSTS_MAP[postId].title,
      caption: DEMO_POSTS_MAP[postId].caption,
      cta: DEMO_POSTS_MAP[postId].cta,
      hashtags: DEMO_POSTS_MAP[postId].hashtags,
      platform: DEMO_POSTS_MAP[postId].platform,
    };
  }

  if (!targetPost) return { ok: false as const, error: "Post not found in this workspace." };

  try {
    const result = await scoreContent({
      hook: targetPost.title,
      caption: targetPost.caption || "",
      cta: targetPost.cta || "",
      hashtags: targetPost.hashtags || "",
      platform: targetPost.platform,
      targetAudience,
    });
    if (workspaceId && userId) {
      try {
        const { supabase } = await getActiveWorkspace();
        await supabase.from("ai_generations").insert({
          workspace_id: workspaceId,
          user_id: userId,
          generation_type: "CONTENT_SCORE",
          input: JSON.stringify({ postId, targetAudience }),
          output: JSON.stringify(result.score),
          provider: result.provider,
        });
      } catch {}
    }
    revalidatePath("/analytics");
    return { ok: true as const, ...result };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Content scoring failed." };
  }
}
