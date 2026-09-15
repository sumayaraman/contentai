import { getActiveWorkspace } from "@/lib/content/workspace";
import { PublishingDashboard } from "@/components/publishing/publishing-dashboard";
import type { Platform, PostStatus } from "@/types/database";
import { listSocialAccounts } from "@/lib/social/actions";
import type { SocialAccount } from "@/lib/social/types";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function PublishingPage() {
  let postList: Array<{ id: string; title: string; caption: string | null; platform: Platform; status: PostStatus; scheduled_at: string | null; published_at: string | null; image_url: string | null }> = [];
  let events: Array<{ id: string; post_id: string; platform: Platform; action: string; status: "SUCCESS" | "FAILED"; external_post_id: string | null; message: string | null; error_code: string | null; attempted_at: string }> = [];
  let accounts: SocialAccount[] = [];

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();
    const [{ data: posts }, { data: eventsData }] = await Promise.all([
      supabase.from("posts").select("id, title, caption, platform, status, scheduled_at, published_at, image_url").eq("workspace_id", workspaceId).in("status", ["SCHEDULED", "PUBLISHED", "FAILED"]).order("scheduled_at", { ascending: true, nullsFirst: false }).limit(200),
      supabase.from("publishing_events").select("id, post_id, platform, action, status, external_post_id, message, error_code, attempted_at").eq("workspace_id", workspaceId).order("attempted_at", { ascending: false }).limit(500),
    ]);
    if (posts) postList = posts as typeof postList;
    if (eventsData) events = eventsData as typeof events;
    accounts = await listSocialAccounts(workspaceId);
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in PublishingPage:", err);
  }

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ Automated Publishing
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Publishing &amp; Social Queue</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage scheduled posts, simulate social dispatch, or publish directly to connected workspace channels.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          Multi-Channel Dispatch
        </div>
      </div>
      <PublishingDashboard posts={postList} events={events} accounts={accounts} />
    </div>
  );
}
