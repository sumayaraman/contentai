"use server";

import { revalidatePath } from "next/cache";
import { getAIProvider } from "@/ai";
import { validateCampaignInput, validateGeneratedCampaign } from "@/ai/campaign-schema";
import type { CampaignGenerationInput, CampaignDay } from "@/ai/types";
import { getActiveWorkspace } from "@/lib/content/workspace";

function ensureDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error("Campaign start date is invalid.");
  return value;
}

export async function generateCampaign(raw: Record<string, unknown>) {
  const workspace = await getActiveWorkspace();
  const { errors, values } = validateCampaignInput(raw);
  if (Object.keys(errors).length) return { ok: false as const, errors };
  try { ensureDate(String(raw.startDate)); } catch (e) { return { ok: false as const, errors: { startDate: e instanceof Error ? e.message : "Invalid start date." } }; }
  const input = { ...values, startDate: String(raw.startDate) } as CampaignGenerationInput;
  let result;
  try { result = await getAIProvider().generateCampaign(input); }
  catch (error) { return { ok: false as const, errors: { form: error instanceof Error ? error.message : "Campaign generation failed." } }; }
  try { validateGeneratedCampaign(result.campaign, input.duration); } catch (error) { return { ok: false as const, errors: { form: error instanceof Error ? error.message : "AI returned an invalid campaign." } }; }
  const { supabase, userId, workspaceId } = workspace;
  const { data: campaign, error } = await supabase.from("campaigns").insert({ workspace_id: workspaceId, created_by: userId, title: result.campaign.title, platform: input.platform, duration_days: input.duration, target_audience: input.targetAudience, tone: input.tone, goal: input.goal, prompt: input.topic, provider: result.provider, status: "DRAFT" }).select("id").single();
  if (error || !campaign) return { ok: false as const, errors: { form: `Campaign generated, but could not be saved: ${error?.message || "Unknown error."}` } };
  const rows = result.campaign.days.map((day) => ({ campaign_id: campaign.id, workspace_id: workspaceId, day_number: day.day, content_idea: day.contentIdea, hook: day.hook, caption: day.caption, cta: day.cta, hashtags: day.hashtags, image_prompt: day.imagePrompt, suggested_date: day.suggestedDate }));
  const { error: daysError } = await supabase.from("campaign_days").insert(rows);
  if (daysError) { await supabase.from("campaigns").delete().eq("id", campaign.id).eq("workspace_id", workspaceId); return { ok: false as const, errors: { form: `Campaign could not be saved: ${daysError.message}` } }; }
  revalidatePath("/campaigns");
  return { ok: true as const, campaignId: campaign.id, title: result.campaign.title, days: result.campaign.days, provider: result.provider, model: result.model };
}

export async function regenerateCampaignDay(campaignId: string, dayNumber: number) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const { data: campaign, error: campaignError } = await supabase.from("campaigns").select("id, title, platform, target_audience, tone, goal, duration_days").eq("id", campaignId).eq("workspace_id", workspaceId).maybeSingle();
  if (campaignError || !campaign) return { ok: false as const, error: campaignError?.message || "Campaign not found." };
  const { data: existing, error } = await supabase.from("campaign_days").select("id, suggested_date").eq("campaign_id", campaignId).eq("workspace_id", workspaceId).eq("day_number", dayNumber).maybeSingle();
  if (error || !existing) return { ok: false as const, error: error?.message || "Campaign day not found." };
  const result = await getAIProvider().generateCampaign({ topic: `${campaign.title} — Day ${dayNumber}`, targetAudience: campaign.target_audience, platform: campaign.platform, tone: campaign.tone as CampaignGenerationInput["tone"], goal: campaign.goal as CampaignGenerationInput["goal"], duration: 1, startDate: existing.suggested_date });
  const day = result.campaign.days[0];
  const { error: updateError } = await supabase.from("campaign_days").update({ content_idea: day.contentIdea, hook: day.hook, caption: day.caption, cta: day.cta, hashtags: day.hashtags, image_prompt: day.imagePrompt }).eq("id", existing.id).eq("workspace_id", workspaceId);
  if (updateError) return { ok: false as const, error: updateError.message };
  revalidatePath("/campaigns");
  return { ok: true as const, day, provider: result.provider };
}

export async function addCampaignDayToCalendar(campaignId: string, day: CampaignDay, scheduled: boolean) {
  const result = await addCampaignToCalendar(campaignId, [day], scheduled);
  return result;
}

export async function updateCampaignDay(campaignId: string, day: CampaignDay) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const { data: existing, error: existingError } = await supabase.from("campaign_days").select("id").eq("campaign_id", campaignId).eq("workspace_id", workspaceId).eq("day_number", day.day).maybeSingle();
  if (existingError || !existing) return { ok: false as const, error: existingError?.message || "Campaign day not found." };
  const { error } = await supabase.from("campaign_days").update({ content_idea: day.contentIdea, hook: day.hook, caption: day.caption, cta: day.cta, hashtags: day.hashtags, image_prompt: day.imagePrompt, suggested_date: day.suggestedDate }).eq("id", existing.id).eq("workspace_id", workspaceId);
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function removeCampaignDay(campaignId: string, dayNumber: number) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const { error } = await supabase.from("campaign_days").delete().eq("campaign_id", campaignId).eq("workspace_id", workspaceId).eq("day_number", dayNumber);
  if (error) return { ok: false as const, error: error.message };
  const { data: remaining } = await supabase.from("campaign_days").select("id").eq("campaign_id", campaignId).eq("workspace_id", workspaceId);
  if (!remaining?.length) await supabase.from("campaigns").update({ status: "ARCHIVED" }).eq("id", campaignId).eq("workspace_id", workspaceId);
  revalidatePath("/campaigns"); return { ok: true as const };
}

export async function addCampaignToCalendar(campaignId: string, days: CampaignDay[], scheduled: boolean) {
  const { supabase, userId, workspaceId } = await getActiveWorkspace();
  const { data: campaign, error: campaignError } = await supabase.from("campaigns").select("id, platform, title").eq("id", campaignId).eq("workspace_id", workspaceId).maybeSingle();
  if (campaignError || !campaign) return { ok: false as const, error: campaignError?.message || "Campaign not found in this workspace." };
  for (const day of days) {
    const date = new Date(`${day.suggestedDate}T09:00:00`);
    if (Number.isNaN(date.getTime())) return { ok: false as const, error: `Day ${day.day} has an invalid date.` };
    if (scheduled && date.getTime() <= Date.now()) return { ok: false as const, error: `Day ${day.day} must be scheduled for a future date.` };
  }
  const { data: linkedDays } = await supabase.from("campaign_days").select("day_number, post_id").eq("campaign_id", campaignId).eq("workspace_id", workspaceId).in("day_number", days.map((d) => d.day));
  const alreadyLinked = (linkedDays ?? []).filter((d) => d.post_id).map((d) => d.day_number);
  if (alreadyLinked.length) return { ok: false as const, error: `Day ${alreadyLinked[0]} has already been added to the calendar.` };
  const posts = days.map((day) => ({ workspace_id: workspaceId, created_by: userId, title: `${campaign.title} — Day ${day.day}`.slice(0, 200), caption: `${day.hook}\n\n${day.caption}`, platform: campaign.platform, status: scheduled ? "SCHEDULED" : "DRAFT", campaign_id: campaignId, cta: day.cta, hashtags: day.hashtags.join(" "), image_prompt: day.imagePrompt, scheduled_at: scheduled ? new Date(`${day.suggestedDate}T09:00:00`).toISOString() : null }));
  const { data: created, error } = await supabase.from("posts").insert(posts).select("id");
  if (error || !created) return { ok: false as const, error: error?.message || "Could not add campaign posts." };
  const ids = created.map((p) => p.id);
  const dayNumbers = days.map((day) => day.day);
  const { data: campaignDays } = await supabase.from("campaign_days").select("id, day_number").eq("campaign_id", campaignId).eq("workspace_id", workspaceId).in("day_number", dayNumbers);
  for (let i = 0; i < days.length; i += 1) {
    const row = (campaignDays ?? []).find((candidate) => candidate.day_number === days[i].day);
    if (!row || !ids[i]) continue;
    await supabase.from("campaign_days").update({ post_id: ids[i] }).eq("id", row.id).eq("workspace_id", workspaceId);
    await supabase.from("posts").update({ campaign_day_id: row.id }).eq("id", ids[i]).eq("workspace_id", workspaceId);
  }
  await supabase.from("campaigns").update({ status: "ADDED_TO_CALENDAR" }).eq("id", campaignId).eq("workspace_id", workspaceId);
  revalidatePath("/calendar"); revalidatePath("/posts"); revalidatePath("/campaigns");
  return { ok: true as const, count: created.length };
}
