import { CampaignGenerator } from "@/components/campaigns/campaign-generator";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Campaign, CampaignDay } from "@/types/database";

export default async function CampaignsPage() {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("id, workspace_id, created_by, title, platform, duration_days, target_audience, tone, goal, prompt, provider, status, created_at, updated_at, campaign_days(id, campaign_id, workspace_id, post_id, day_number, content_idea, hook, caption, cta, hashtags, image_prompt, suggested_date, created_at, updated_at)")
    .eq("workspace_id", workspaceId)
    .neq("status", "ARCHIVED")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  const history = (campaigns ?? []) as unknown as (Campaign & { campaign_days: CampaignDay[] })[];

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <div>
          <p className="ai-tag" style={{ marginBottom: 6 }}>✦ AI Campaigns</p>
          <h1 className="page-title">Plan a complete campaign in minutes</h1>
          <p className="page-subtitle">
            Generate a structured multi-day campaign, refine each idea, then add the final plan to your calendar.
          </p>
        </div>
        <span className="badge badge-ai">
          <span className="ai-dot" style={{ width: 5, height: 5 }} />
          AI Powered
        </span>
      </div>
      <CampaignGenerator history={history} />
    </div>
  );
}
