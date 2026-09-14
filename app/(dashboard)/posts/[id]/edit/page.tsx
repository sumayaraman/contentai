import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { PostEditor } from "@/components/posts/post-editor";
import type { Category, Media, Post } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post: Post | null = null;
  let categories: Category[] = [];
  let media: Media[] = [];

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();
    const [{ data: postData }, { data: catData }, { data: mediaData }] = await Promise.all([
      supabase.from("posts").select("id, workspace_id, created_by, title, caption, platform, status, category_id, cta, hashtags, image_url, image_prompt, scheduled_at, published_at, created_at, updated_at").eq("id", id).eq("workspace_id", workspaceId).maybeSingle(),
      supabase.from("categories").select("id, workspace_id, name, color, created_at").eq("workspace_id", workspaceId).order("name"),
      supabase.from("media").select("id, workspace_id, uploaded_by, file_name, mime_type, file_size, storage_path, url, source, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100),
    ]);
    if (postData) post = postData as Post;
    if (catData) categories = catData as Category[];
    if (mediaData) media = mediaData as Media[];
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in EditPostPage:", err);
  }

  if (!post) notFound();

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-6">
      <div>
        <Link href="/posts" className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition mb-4">
          <ArrowLeft size={14} /> Back to Posts
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 mb-2">
          Content management
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Edit Post</h1>
        <p className="mt-1 text-xs text-white/50">Update your content, media, platform, and publishing details.</p>
      </div>
      <PostEditor post={post} categories={categories} media={media} />
    </div>
  );
}

