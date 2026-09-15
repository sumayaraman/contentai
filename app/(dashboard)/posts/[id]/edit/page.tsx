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
    <div className="page animate-fade-up campaign-container" style={{ maxWidth: 1360, margin: "0 auto", gap: 28 }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ Content Editor
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Edit Post</h1>
          <p className="mt-1 text-sm text-white/50">
            Update post copy, media assets, platform channels, and publication schedule.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/posts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 38,
              padding: "0 16px",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              color: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.15s ease",
            }}
            className="hover:text-white hover:border-white/20"
          >
            <ArrowLeft size={14} /> Back to Posts
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            Multi-Channel Dispatch
          </div>
        </div>
      </div>
      <PostEditor post={post} categories={categories} media={media} />
    </div>
  );
}

