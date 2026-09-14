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
    <div className="page animate-fade-up">
      <div className="page-header">
        <div>
          <p className="ai-tag" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={13} /> Content planning
          </p>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Plan scheduled content, review your publishing rhythm, and move posts to a better time.</p>
        </div>
        <Link href="/posts/new" className="btn btn-ai">
          <Plus size={15} /> Create Post
        </Link>
      </div>
      <ContentCalendar posts={calendarPosts} categories={categoryList} />
    </div>
  );
}

