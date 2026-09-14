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
    <div className="page animate-fade-up">
      <div className="page-header">
        <div>
          <p className="ai-tag" style={{ marginBottom: 6 }}>✦ Asset Storage</p>
          <h1 className="page-title">Media Library</h1>
          <p className="page-subtitle">
            Upload, store, and organize images and AI-generated artwork for your social posts.
          </p>
        </div>
        <span className="badge badge-ai">
          <span className="ai-dot" style={{ width: 5, height: 5 }} />
          Cloud Stored
        </span>
      </div>
      <MediaLibrary media={mediaList} />
    </div>
  );
}
