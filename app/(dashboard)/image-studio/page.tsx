import { ImageGenerator } from "@/components/image/image-generator";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Post } from "@/types/database";

export default async function ImageStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const { prompt } = await searchParams;

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, title, platform")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (postsError) throw new Error(postsError.message);

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Image &amp; Video Studio</h1>
          <p className="page-subtitle">Generate images and short videos from one prompt — free.</p>
        </div>
        <span className="badge badge-ai">
          <span className="ai-dot" style={{ width: 5, height: 5 }} />
          AI Powered
        </span>
      </div>

      <ImageGenerator
        posts={(posts ?? []) as Pick<Post, "id" | "title" | "platform">[]}
        initialPrompt={prompt ?? ""}
      />
    </div>
  );
}
