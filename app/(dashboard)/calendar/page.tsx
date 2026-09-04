import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { ContentCalendar } from "@/components/calendar/content-calendar";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Category, Post } from "@/types/database";

export default async function CalendarPage() {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const [{ data: posts, error: postsError }, { data: categories, error: categoriesError }] = await Promise.all([
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

  if (postsError) throw new Error(postsError.message);
  if (categoriesError) throw new Error(categoriesError.message);

  const calendarPosts = (posts ?? []) as unknown as (Post & { categories: { name: string; color: string } | null })[];
  const categoryList = (categories ?? []) as Category[];

  return <div className="mx-auto max-w-[1500px] space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-blue-600"><CalendarDays size={16} /> Content planning</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Calendar</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">Plan scheduled content, review your publishing rhythm, and move posts to a better time.</p>
      </div>
      <Link href="/posts/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"><Plus size={17} /> Create Post</Link>
    </div>
    <ContentCalendar posts={calendarPosts} categories={categoryList} />
  </div>;
}
