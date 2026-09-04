import { CampaignGenerator } from "@/components/campaigns/campaign-generator";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Campaign, CampaignDay } from "@/types/database";

export default async function CampaignsPage() {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const { data: campaigns, error } = await supabase.from("campaigns").select("id, workspace_id, created_by, title, platform, duration_days, target_audience, tone, goal, prompt, provider, status, created_at, updated_at, campaign_days(id, campaign_id, workspace_id, post_id, day_number, content_idea, hook, caption, cta, hashtags, image_prompt, suggested_date, created_at, updated_at)").eq("workspace_id", workspaceId).neq("status", "ARCHIVED").order("created_at", { ascending: false }).limit(20);
  if (error) throw new Error(error.message);
  const history = (campaigns ?? []) as unknown as (Campaign & { campaign_days: CampaignDay[] })[];
  return <div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-medium text-blue-600">AI Campaigns</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Plan a complete campaign in minutes</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Generate a structured multi-day campaign, refine each idea, then add the final plan to your calendar.</p></div><CampaignGenerator history={history} /></div>;
}
