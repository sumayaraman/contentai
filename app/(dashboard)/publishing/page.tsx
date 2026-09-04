import { RadioTower } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { PublishingDashboard } from "@/components/publishing/publishing-dashboard";
import type { Platform, PostStatus } from "@/types/database";
import { listSocialAccounts } from "@/lib/social/actions";

export default async function PublishingPage() {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const [{ data: posts, error: postsError }, { data: events, error: eventsError }] = await Promise.all([
    supabase.from("posts").select("id, title, caption, platform, status, scheduled_at, published_at, image_url").eq("workspace_id", workspaceId).in("status", ["SCHEDULED", "PUBLISHED", "FAILED"]).order("scheduled_at", { ascending: true, nullsFirst: false }).limit(200),
    supabase.from("publishing_events").select("id, post_id, platform, action, status, external_post_id, message, error_code, attempted_at").eq("workspace_id", workspaceId).order("attempted_at", { ascending: false }).limit(500),
  ]);
  if (postsError) throw new Error(postsError.message);
  if (eventsError) throw new Error(eventsError.message);
  const accounts = await listSocialAccounts(workspaceId);

  const postList = (posts ?? []) as Array<{ id: string; title: string; caption: string | null; platform: Platform; status: PostStatus; scheduled_at: string | null; published_at: string | null; image_url: string | null }>;
  return <div className="mx-auto max-w-7xl space-y-6">
    <div><p className="flex items-center gap-2 text-sm font-medium text-blue-600"><RadioTower size={16} /> Demo publishing</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Publishing Simulator</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">Use Demo Mode when no account is connected, or publish to a connected real account.</p></div>
    <PublishingDashboard posts={postList} events={(events ?? []) as Array<{ id: string; post_id: string; platform: Platform; action: string; status: "SUCCESS" | "FAILED"; external_post_id: string | null; message: string | null; error_code: string | null; attempted_at: string }>} accounts={accounts} />
  </div>;
}
