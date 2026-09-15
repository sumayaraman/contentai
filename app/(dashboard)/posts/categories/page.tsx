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
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ Content Taxonomy
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-white/50">
            Create and manage color-coded tags to organize your posts, streamline multi-channel campaigns, and filter analytics themes.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          Workspace Tags
        </div>
      </div>

      {/* Category Manager */}
      <CategoryManager categories={categories} />
    </div>
  );
}
