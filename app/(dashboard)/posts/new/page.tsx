import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { PostEditor } from "@/components/posts/post-editor";
import type { Category, Media } from "@/types/database";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const scheduled = Array.isArray(params.scheduled) ? params.scheduled[0] : params.scheduled;
  const initialStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const { supabase, workspaceId } = await getActiveWorkspace();
  const [{ data: categories }, { data: media }] = await Promise.all([
    supabase.from("categories").select("id, workspace_id, name, color, created_at").eq("workspace_id", workspaceId).order("name"),
    supabase.from("media").select("id, workspace_id, uploaded_by, file_name, mime_type, file_size, storage_path, url, source, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100),
  ]);
  return <div className="mx-auto max-w-7xl space-y-6"><div><Link href="/posts" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={15} /> Back to Posts</Link><p className="mt-5 text-sm font-medium text-blue-600">Content management</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Create Post</h1><p className="mt-1 text-sm text-slate-500">Build a post and save it as a draft until it is ready.</p></div><PostEditor post={null} initialScheduledAt={scheduled || null} initialStatus={initialStatus === "SCHEDULED" ? "SCHEDULED" : "DRAFT"} categories={(categories ?? []) as Category[]} media={(media ?? []) as Media[]} /></div>;
}
