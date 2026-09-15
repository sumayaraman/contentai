import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { ContentCalendar } from "@/components/calendar/content-calendar";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Category, Post } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function CalendarPage() {
  let calendarPosts: (Post & { categories: { name: string; color: string } | null })[] = [];
  let categoryList: Category[] = [];

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();
    const [{ data: posts }, { data: categories }] = await Promise.all([
      supabase
        .from("posts")
        .select("id, workspace_id, created_by, title, caption, platform, status, category_id, cta, hashtags, image_url, image_prompt, scheduled_at, published_at, created_at, updated_at, categories!posts_category_id_fkey(name, color)")
        .eq("workspace_id", workspaceId)
        .not("scheduled_at", "is", null)
        .order("scheduled_at", { ascending: true })
        .limit(500),
      supabase
        .from("categories")
        .select("id, workspace_id, name, color, created_at")
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true }),
    ]);

    if (posts) calendarPosts = posts as unknown as typeof calendarPosts;
    if (categories) categoryList = categories as Category[];
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in CalendarPage:", err);
  }

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            <CalendarDays size={13} /> Content Schedule
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Editorial Calendar</h1>
          <p className="mt-1 text-sm text-white/50">Plan and coordinate scheduled content, balance publication rhythms across channels, and reschedule on the fly.</p>
        </div>
        <Link
          href="/posts/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500"
        >
          <Plus size={15} /> Create Post
        </Link>
      </div>
      <ContentCalendar posts={calendarPosts} categories={categoryList} />
    </div>
  );
}

