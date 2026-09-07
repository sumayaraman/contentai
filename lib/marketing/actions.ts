"use server";

import { revalidatePath } from "next/cache";
import { getAIProvider } from "@/ai";
import { validateGeneratedCampaign } from "@/ai/campaign-schema";
import type { AIPlatform, AITone, AIObjective, CampaignDay } from "@/ai/types";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { generateImage } from "@/lib/image/actions";

const platforms = new Set<AIPlatform>(["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"]);
const tones = new Set<AITone>(["PROFESSIONAL", "FRIENDLY", "FUNNY", "INSPIRATIONAL", "EDUCATIONAL", "LUXURY", "CASUAL"]);
const goals = new Set<AIObjective>(["ENGAGEMENT", "SALES", "AWARENESS", "TRAFFIC", "LEADS", "BRAND_BUILDING"]);

export async function generateMarketingPlan(input: {
  businessName: string;
  description: string;
  audience: string;
  platform: AIPlatform;
  tone: AITone;
  goal: AIObjective;
  startDate: string;
  duration: number;
  postsPerDay: number;
  brandVoice: string;
}) {
  await getActiveWorkspace();
  const duration = Math.max(1, Math.min(30, Math.floor(input.duration)));
  const postsPerDay = Math.max(1, Math.min(3, Math.floor(input.postsPerDay)));
  if (!platforms.has(input.platform) || !tones.has(input.tone) || !goals.has(input.goal)) return { ok: false as const, error: "Invalid marketing plan settings." };
  if (!input.businessName.trim() || !input.description.trim() || !input.audience.trim()) return { ok: false as const, error: "Business name, description and audience are required." };
  if (Number.isNaN(new Date(`${input.startDate}T12:00:00`).getTime())) return { ok: false as const, error: "Choose a valid start date." };

  const provider = getAIProvider();
  const plans: CampaignDay[][] = [];
  try {
    for (let slot = 0; slot < postsPerDay; slot += 1) {
      const result = await provider.generateCampaign({
        topic: `${input.businessName}: ${input.description}. Create content angle ${slot + 1} of ${postsPerDay}; keep this angle distinct from the other daily slots. Brand voice: ${input.brandVoice || "friendly and professional"}.`,
        targetAudience: input.audience,
        platform: input.platform,
        tone: input.tone,
        goal: input.goal,
        duration,
        startDate: input.startDate,
      });
      const validated = validateGeneratedCampaign(result.campaign, duration);
      plans.push(validated.days);
    }
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Could not generate the marketing plan." };
  }

  const items = Array.from({ length: duration }, (_, dayIndex) => Array.from({ length: postsPerDay }, (_, slotIndex) => {
    const day = plans[slotIndex][dayIndex];
    return { ...day, day: dayIndex + 1, slot: slotIndex + 1 };
  })).flat();

  return { ok: true as const, items, provider: provider.name };
}

export async function generateMarketingImage(prompt: string, size: "1024x1024" | "1536x1024" | "1024x1536") {
  await getActiveWorkspace();
  const form = new FormData();
  form.set("prompt", prompt);
  form.set("size", size);
  return generateImage(form);
}

export async function saveMarketingPosts(items: Array<{
  title: string;
  caption: string;
  platform: AIPlatform;
  cta: string;
  hashtags: string[];
  imageUrl: string | null;
  imagePrompt: string;
  scheduledAt: string;
  status: "DRAFT" | "SCHEDULED";
}>) {
  const { supabase, userId, workspaceId } = await getActiveWorkspace();
  if (!items.length || items.length > 90) return { ok: false as const, error: "Marketing batch must contain between 1 and 90 posts." };
  const rows = items.map((item) => ({
    workspace_id: workspaceId,
    created_by: userId,
    title: item.title.slice(0, 200),
    caption: item.caption,
    platform: item.platform,
    status: item.status,
    cta: item.cta,
    hashtags: item.hashtags.join(" "),
    image_url: item.imageUrl,
    image_prompt: item.imagePrompt,
    scheduled_at: item.status === "SCHEDULED" ? item.scheduledAt : null,
  }));
  const { data, error } = await supabase.from("posts").insert(rows).select("id");
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/posts");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/workspace");
  return { ok: true as const, count: data?.length ?? 0 };
}
