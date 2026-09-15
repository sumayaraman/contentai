import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { getAnalyticsDashboard, getMockAnalyticsForPreview } from "@/lib/analytics/service";
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

    if (cats && cats.length > 0) {
      categories = cats as Pick<Category, "id" | "name">[];
    } else {
      categories = [
        { id: "cat-edu", name: "Educational" },
        { id: "cat-prod", name: "Product Launch" },
        { id: "cat-bts", name: "Behind the Scenes" },
        { id: "cat-promo", name: "Promotional" },
        { id: "cat-comm", name: "Community & Culture" },
      ];
    }

    if (postData && postData.length > 0) {
      posts = postData as Post[];
    } else {
      posts = getMockAnalyticsForPreview(workspaceId) as unknown as Post[];
    }

    data = await getAnalyticsDashboard(supabase, workspaceId, { platform, categoryId: category });
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in AnalyticsPage:", err);
  }

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ Performance Intelligence
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Analytics &amp; Insights</h1>
          <p className="mt-1 text-sm text-white/50">
            Analyze reach, track engagement rates, and score post effectiveness.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          Multi-Platform Metrics
        </div>
      </div>
      <AnalyticsDashboard initialData={data} categories={categories} posts={posts} initialPlatform={platform} initialCategory={category} />
    </div>
  );
}

