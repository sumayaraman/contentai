import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { PostEditor } from "@/components/posts/post-editor";
import type { Category, Media } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function NewPostPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const scheduled = Array.isArray(params.scheduled) ? params.scheduled[0] : params.scheduled;
  const initialStatus = Array.isArray(params.status) ? params.status[0] : params.status;

  let categories: Category[] = [];
  let media: Media[] = [];

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();
    const [{ data: catData }, { data: mediaData }] = await Promise.all([
      supabase.from("categories").select("id, workspace_id, name, color, created_at").eq("workspace_id", workspaceId).order("name"),
      supabase.from("media").select("id, workspace_id, uploaded_by, file_name, mime_type, file_size, storage_path, url, source, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100),
    ]);
    if (catData) categories = catData as Category[];
    if (mediaData) media = mediaData as Media[];
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in NewPostPage:", err);
  }

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/posts" className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition mb-4">
          <ArrowLeft size={14} /> Back to Posts
        </Link>
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300">
            ✦ Content Composer
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Create Post</h1>
          <p className="text-sm text-white/50">Build a new social post, attach media assets, and save as a draft or schedule for automated publishing.</p>
        </div>
      </div>
      <PostEditor post={null} initialScheduledAt={scheduled || null} initialStatus={initialStatus === "SCHEDULED" ? "SCHEDULED" : "DRAFT"} categories={categories} media={media} />
    </div>
  );
}

