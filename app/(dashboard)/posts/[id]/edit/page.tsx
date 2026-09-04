import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { PostEditor } from "@/components/posts/post-editor";
import type { Category, Media, Post } from "@/types/database";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, workspaceId } = await getActiveWorkspace();
  const [{ data: post, error: postError }, { data: categories }, { data: media }] = await Promise.all([
    supabase.from("posts").select("id, workspace_id, created_by, title, caption, platform, status, category_id, cta, hashtags, image_url, image_prompt, scheduled_at, published_at, created_at, updated_at").eq("id", id).eq("workspace_id", workspaceId).maybeSingle(),
    supabase.from("categories").select("id, workspace_id, name, color, created_at").eq("workspace_id", workspaceId).order("name"),
    supabase.from("media").select("id, workspace_id, uploaded_by, file_name, mime_type, file_size, storage_path, url, source, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100),
  ]);
  if (postError) throw new Error(postError.message);
  if (!post) notFound();
  return <div className="mx-auto max-w-7xl space-y-6"><div><Link href="/posts" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={15} /> Back to Posts</Link><p className="mt-5 text-sm font-medium text-blue-600">Content management</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Edit Post</h1><p className="mt-1 text-sm text-slate-500">Update your content, media, platform, and publishing details.</p></div><PostEditor post={post as Post} categories={(categories ?? []) as Category[]} media={(media ?? []) as Media[]} /></div>;
}
