import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { getAnalyticsDashboard } from "@/lib/analytics/service";
import type { Category, Post } from "@/types/database";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ platform?: string; category?: string }> }) {
  const params = await searchParams;
  const platform = params.platform && ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"].includes(params.platform) ? params.platform as import("@/types/database").Platform : "ALL";
  const category = params.category || "ALL";
  const { supabase, workspaceId } = await getActiveWorkspace();
  const [{ data: categories }, { data: posts }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("workspace_id", workspaceId).order("name"),
    supabase.from("posts").select("id, workspace_id, created_by, title, caption, platform, status, category_id, cta, hashtags, image_url, image_prompt, scheduled_at, published_at, created_at, updated_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
  ]);
  const data = await getAnalyticsDashboard(supabase, workspaceId, { platform, categoryId: category });
  return <AnalyticsDashboard initialData={data} categories={(categories ?? []) as Pick<Category, "id" | "name">[]} posts={(posts ?? []) as Post[]} initialPlatform={platform} initialCategory={category} />;
}
