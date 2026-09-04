import Link from "next/link";
import { ArrowUpRight, FileText, Send, CalendarClock, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Post, PostStatus } from "@/types/database";

const cards = [
  { key: "total", label: "Total Posts", icon: FileText },
  { key: "draft", label: "Draft Posts", icon: FileText },
  { key: "scheduled", label: "Scheduled Posts", icon: CalendarClock },
  { key: "published", label: "Published Posts", icon: CheckCircle2 },
] as const;

export default async function DashboardPage() {
  const { profile } = await getCurrentUser();
  const { supabase, workspaceId } = await getActiveWorkspace();

  let counts = { total: 0, draft: 0, scheduled: 0, published: 0 };
  let recentPosts: Post[] = [];

  if (workspaceId) {
    const [total, draft, scheduled, published, recent] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "DRAFT"),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "SCHEDULED"),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "PUBLISHED"),
      supabase.from("posts").select("id, workspace_id, created_by, title, caption, platform, status, category_id, cta, image_url, image_prompt, scheduled_at, published_at, created_at, updated_at, hashtags, categories(name)").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(5),
    ]);
    counts = { total: total.count ?? 0, draft: draft.count ?? 0, scheduled: scheduled.count ?? 0, published: published.count ?? 0 };
    recentPosts = (recent.data ?? []) as unknown as Post[];
  }

  const firstName = profile?.name?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-blue-600">Workspace overview</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Good afternoon, {firstName}</h1><p className="mt-1 text-sm text-slate-500">Here’s what’s happening with your content today.</p></div>
        <Link href="/posts/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Send size={16} /> Create Post</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon }) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Icon size={18} /></div><span className="text-xs font-medium text-slate-400">Live</span></div>
            <div className="mt-4 text-2xl font-bold text-slate-950">{counts[key]}</div><div className="mt-1 text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-slate-950">Engagement Overview</h2><p className="mt-1 text-xs text-slate-500">A visual foundation for future analytics.</p></div><Link href="/analytics" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View analytics <ArrowUpRight size={13} className="ml-1 inline" /></Link></div><EngagementChart /></section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-950">Quick Actions</h2><p className="mt-1 text-xs text-slate-500">Jump into your next content task.</p><div className="mt-4"><QuickActions /></div></section>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-slate-950">Recent Posts</h2><p className="mt-1 text-xs text-slate-500">Your latest content in this workspace.</p></div><Link href="/posts" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all <ArrowUpRight size={13} className="ml-1 inline" /></Link></div>
        {recentPosts.length === 0 ? <div className="px-5 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><FileText size={20} className="text-slate-400" /></div><h3 className="mt-3 text-sm font-semibold text-slate-900">No posts yet</h3><p className="mt-1 text-sm text-slate-500">Create your first post to start building your content workspace.</p><Link href="/posts/new" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Create your first post</Link></div> : <div className="divide-y divide-slate-100">{recentPosts.map((post) => <div key={post.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[110px_1fr_110px_150px] sm:items-center"><div className="text-xs font-semibold text-slate-500">{post.platform}</div><div><div className="font-medium text-slate-900">{post.title}</div><div className="mt-1 truncate text-xs text-slate-500">{post.caption || "No caption"}</div></div><StatusBadge status={post.status as PostStatus} /><div className="text-xs text-slate-500">{post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "Not scheduled"}</div></div>)}</div>}
      </section>
    </div>
  );
}
