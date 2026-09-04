import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { CategoryManager } from "@/components/posts/category-manager";
import type { Category } from "@/types/database";

export default async function CategoriesPage() {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const { data, error } = await supabase.from("categories").select("id, workspace_id, name, color, created_at").eq("workspace_id", workspaceId).order("name");
  if (error) throw new Error(error.message);
  return <div className="mx-auto max-w-4xl space-y-6"><div><Link href="/posts" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={15} /> Back to Posts</Link><div className="mt-5 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FolderOpen size={19} /></div><div><p className="text-sm font-medium text-blue-600">Content organization</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Categories</h1><p className="mt-1 text-sm text-slate-500">Organize posts with workspace-specific content categories.</p></div></div></div><CategoryManager categories={(data ?? []) as Category[]} /></div>;
}
