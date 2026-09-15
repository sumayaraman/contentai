import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { CategoryManager } from "@/components/posts/category-manager";
import type { Category } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();
    const { data } = await supabase
      .from("categories")
      .select("id, workspace_id, name, color, created_at")
      .eq("workspace_id", workspaceId)
      .order("name");
    if (data) categories = data as Category[];
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in CategoriesPage:", err);
  }

  return (
    <div className="page animate-fade-up">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Posts</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="page-header !mb-2">
          <div>
            <p className="ai-tag" style={{ marginBottom: 6 }}>✦ Content Taxonomy</p>
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle">
              Create and manage color-coded tags to organize your posts, streamline multi-channel campaigns, and filter analytics themes.
            </p>
          </div>
        </div>

        {/* Category Manager */}
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
