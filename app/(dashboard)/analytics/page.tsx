import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { getAnalyticsDashboard } from "@/lib/analytics/service";
import type { Category, Post } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ platform?: string; category?: string }> }) {
  const params = await searchParams;
  const platform = params.platform && ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"].includes(params.platform) ? params.platform as import("@/types/database").Platform : "ALL";
  const category = params.category || "ALL";

  let categories: Pick<Category, "id" | "name">[] = [];
  let posts: Post[] = [];
  let data: Awaited<ReturnType<typeof getAnalyticsDashboard>> = {
    summary: { totalPublishedPosts: 0, likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, engagementRate: 0 },
    engagementOverTime: [],
    platformPerformance: [],
    categoryPerformance: [],
    bestPosts: [],
  };

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();
    const [{ data: cats }, { data: postData }] = await Promise.all([
      supabase.from("categories").select("id, name").eq("workspace_id", workspaceId).order("name"),
      supabase.from("posts").select("id, workspace_id, created_by, title, caption, platform, status, category_id, cta, hashtags, image_url, image_prompt, scheduled_at, published_at, created_at, updated_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    ]);
    if (cats) categories = cats as Pick<Category, "id" | "name">[];
    if (postData) posts = postData as Post[];
    data = await getAnalyticsDashboard(supabase, workspaceId, { platform, categoryId: category });
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in AnalyticsPage:", err);
  }

  return (
    <div className="page animate-fade-up">
      <AnalyticsDashboard initialData={data} categories={categories} posts={posts} initialPlatform={platform} initialCategory={category} />
    </div>
  );
}

