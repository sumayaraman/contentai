import { getActiveWorkspace } from "@/lib/content/workspace";
import { MediaLibrary } from "@/components/media/media-library";
import type { Media } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function MediaLibraryPage() {
  let mediaList: Media[] = [];

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();
    const { data } = await supabase
      .from("media")
      .select("id, workspace_id, uploaded_by, file_name, mime_type, file_size, storage_path, url, source, generation_prompt, generation_provider, generation_model, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (data) mediaList = data as Media[];
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in MediaLibraryPage:", err);
  }

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ Asset Storage
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Media Library</h1>
          <p className="mt-1 text-sm text-white/50">
            Upload, store, and organize images and AI-generated artwork for your social posts.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          Cloud Stored
        </div>
      </div>
      <MediaLibrary media={mediaList} />
    </div>
  );
}
