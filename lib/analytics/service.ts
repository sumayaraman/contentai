import type { SupabaseClient } from "@supabase/supabase-js";
import type { Platform, Post } from "@/types/database";
import type { AnalyticsDashboardData, AnalyticsPoint, BestPerformingPost, CategoryPerformance, PlatformPerformance } from "./types";

const platforms: Platform[] = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"];
const categoryFallback = ["Educational", "Promotional", "Product", "Behind the Scenes", "Engagement"];

type AnalyticsRow = {
  id: string;
  post_id: string;
  platform: Platform;
  likes: number | string;
  comments: number | string;
  shares: number | string;
  reach: number | string;
  impressions: number | string;
  engagement_rate: number | string;
  recorded_at: string;
};

type PostRow = Post & { categories?: { name?: string } | null };

type Metric = Omit<BestPerformingPost, "id" | "title" | "caption" | "platform" | "categoryName" | "publishedAt" | "imageUrl">;

function number(value: number | string | null | undefined) {
  return Number(value ?? 0) || 0;
}

function engagement(likes: number, comments: number, shares: number, reach: number) {
  return reach > 0 ? ((likes + comments + shares) / reach) * 100 : 0;
}

function seedFor(postId: string) {
  return Array.from(postId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function mockMetrics(post: PostRow, index: number): Metric {
  const seed = seedFor(post.id) + index * 17;
  const reach = 850 + (seed % 5200);
  const likes = Math.round(reach * (0.035 + (seed % 35) / 1000));
  const comments = Math.round(reach * (0.006 + (seed % 10) / 1000));
  const shares = Math.round(reach * (0.004 + (seed % 8) / 1000));
  const impressions = Math.round(reach * (1.35 + (seed % 90) / 100));
  return { likes, comments, shares, reach, impressions, engagementRate: engagement(likes, comments, shares, reach) };
}

function aggregate(rows: Metric[]) {
  const totals = rows.reduce((acc, row) => ({
    likes: acc.likes + row.likes,
    comments: acc.comments + row.comments,
    shares: acc.shares + row.shares,
    reach: acc.reach + row.reach,
    impressions: acc.impressions + row.impressions,
  }), { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0 });
  return { ...totals, engagementRate: engagement(totals.likes, totals.comments, totals.shares, totals.reach) };
}

export async function getAnalyticsDashboard(supabase: SupabaseClient, workspaceId: string, filters?: { platform?: Platform | "ALL"; categoryId?: string | "ALL" }) : Promise<AnalyticsDashboardData> {
  const { data: postRows, error: postError } = await supabase
    .from("posts")
    .select("id, workspace_id, created_by, title, caption, platform, status, category_id, cta, hashtags, image_url, image_prompt, scheduled_at, published_at, created_at, updated_at, categories!posts_category_id_fkey(id, name)")
    .eq("workspace_id", workspaceId)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: true });
  if (postError) throw new Error(postError.message);

  let posts = (postRows ?? []) as PostRow[];
  if (filters?.platform && filters.platform !== "ALL") posts = posts.filter((post) => post.platform === filters.platform);
  if (filters?.categoryId && filters.categoryId !== "ALL") posts = posts.filter((post) => post.category_id === filters.categoryId);

  const postIds = posts.map((post) => post.id);
  let realRows: AnalyticsRow[] = [];
  if (postIds.length) {
    const { data, error } = await supabase.from("analytics").select("id, post_id, platform, likes, comments, shares, reach, impressions, engagement_rate, recorded_at").in("post_id", postIds).order("recorded_at", { ascending: true });
    if (error) throw new Error(error.message);
    realRows = (data ?? []) as AnalyticsRow[];
  }

  const latestByPost = new Map<string, AnalyticsRow>();
  for (const row of realRows) latestByPost.set(row.post_id, row);
  const metricsByPost = new Map<string, Metric>();
  posts.forEach((post, index) => {
    const row = latestByPost.get(post.id);
    metricsByPost.set(post.id, row ? {
      likes: number(row.likes), comments: number(row.comments), shares: number(row.shares), reach: number(row.reach), impressions: number(row.impressions), engagementRate: number(row.engagement_rate),
    } : mockMetrics(post, index));
  });

  const metrics = posts.map((post) => metricsByPost.get(post.id)!);
  const summaryTotals = aggregate(metrics);
  const summary = { totalPublishedPosts: posts.length, ...summaryTotals };

  const platformPerformance: PlatformPerformance[] = platforms.map((platform) => {
    const group = posts.map((post, index) => ({ post, metric: metricsByPost.get(post.id) ?? mockMetrics(post, index) })).filter(({ post }) => post.platform === platform);
    const totals = aggregate(group.map(({ metric }) => metric));
    return { platform, posts: group.length, ...totals };
  });

  const categoryMap = new Map<string, CategoryPerformance>();
  posts.forEach((post) => {
    const categoryId = post.category_id;
    const categoryName = post.categories?.name || (categoryId ? "Uncategorized" : "Uncategorized");
    const key = categoryId ?? "uncategorized";
    const current = categoryMap.get(key) ?? { categoryId, categoryName, posts: 0, likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, engagementRate: 0 };
    const metric = metricsByPost.get(post.id)!;
    current.posts += 1; current.likes += metric.likes; current.comments += metric.comments; current.shares += metric.shares; current.reach += metric.reach; current.impressions += metric.impressions;
    current.engagementRate = engagement(current.likes, current.comments, current.shares, current.reach);
    categoryMap.set(key, current);
  });
  const categoryPerformance = [...categoryMap.values()].sort((a, b) => b.engagementRate - a.engagementRate);

  const bestPosts: BestPerformingPost[] = posts.map((post) => {
    const metric = metricsByPost.get(post.id)!;
    return { id: post.id, title: post.title, caption: post.caption, platform: post.platform, categoryName: post.categories?.name || "Uncategorized", ...metric, publishedAt: post.published_at, imageUrl: post.image_url };
  }).sort((a, b) => b.engagementRate - a.engagementRate).slice(0, 10);

  const buckets = new Map<string, Metric>();
  for (const post of posts) {
    const date = (post.published_at || post.created_at).slice(0, 10);
    const existing = buckets.get(date) ?? { likes: 0, comments: 0, shares: 0, reach: 0, impressions: 0, engagementRate: 0 };
    const metric = metricsByPost.get(post.id)!;
    existing.likes += metric.likes; existing.comments += metric.comments; existing.shares += metric.shares; existing.reach += metric.reach; existing.impressions += metric.impressions;
    existing.engagementRate = engagement(existing.likes, existing.comments, existing.shares, existing.reach);
    buckets.set(date, existing);
  }
  const engagementOverTime: AnalyticsPoint[] = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-30).map(([date, metric]) => ({ date, ...metric }));

  return { summary, engagementOverTime, platformPerformance, categoryPerformance, bestPosts };
}

export function getMockAnalyticsForPreview() {
  const now = new Date();
  const posts = Array.from({ length: 7 }, (_, index) => ({ id: `preview-${index}`, platform: platforms[index % platforms.length], category_id: index % 2 ? "promo" : "edu", categories: { name: categoryFallback[index % categoryFallback.length] }, title: `Demo campaign post ${index + 1}`, caption: "A realistic demo post for analytics preview.", status: "PUBLISHED", published_at: new Date(now.getTime() - (6 - index) * 86400000).toISOString(), created_at: now.toISOString() })) as unknown as PostRow[];
  return posts;
}
