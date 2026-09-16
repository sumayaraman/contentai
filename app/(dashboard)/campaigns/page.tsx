import { CampaignGenerator } from "@/components/campaigns/campaign-generator";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Campaign, CampaignDay } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function CampaignsPage() {
  let history: (Campaign & { campaign_days: CampaignDay[] })[] = [];

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("id, workspace_id, created_by, title, platform, duration_days, target_audience, tone, goal, prompt, provider, status, created_at, updated_at, campaign_days(id, campaign_id, workspace_id, post_id, day_number, content_idea, hook, caption, cta, hashtags, image_prompt, suggested_date, created_at, updated_at)")
      .eq("workspace_id", workspaceId)
      .neq("status", "ARCHIVED")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && campaigns) {
      history = campaigns as unknown as (Campaign & { campaign_days: CampaignDay[] })[];
    }
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in CampaignsPage:", err);
  }

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ Campaign Studio
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Campaigns</h1>
          <p className="mt-1 text-sm text-white/50 max-w-xl">
            Organize multiple social posts around one goal. Generate a structured multi-day strategy, refine hooks, and batch schedule directly to your calendar.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          AI Powered Studio
        </div>
      </div>
      <CampaignGenerator history={history} />
    </div>
  );
}
