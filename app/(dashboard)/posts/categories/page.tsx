import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";
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
      <div className="mx-auto max-w-6xl space-y-8 pb-20">
        <div>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition mb-3 group"
          >
            <ArrowLeft size={13} className="transition group-hover:-translate-x-0.5" />
            <span>Back to Posts</span>
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                  <FolderOpen size={13} /> Content Organization
                </span>
              </div>
              <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Categories
              </h1>
              <p className="mt-1.5 text-sm text-white/50 leading-relaxed max-w-2xl">
                Create and manage color-coded tags to organize your posts, streamline multi-channel campaigns, and filter analytics themes.
              </p>
            </div>
          </div>
        </div>
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}

