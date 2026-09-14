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
    <div className="page animate-fade-up max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/posts" className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition mb-4">
          <ArrowLeft size={14} /> Back to Posts
        </Link>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400 shadow-sm">
            <FolderOpen size={20} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">
              Content organization
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Categories</h1>
            <p className="mt-1 text-xs text-white/50">Organize posts with workspace-specific content categories and theme colors.</p>
          </div>
        </div>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}

