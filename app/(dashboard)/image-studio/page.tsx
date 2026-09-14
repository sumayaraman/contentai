import { ImageGenerator } from "@/components/image/image-generator";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Post } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function ImageStudioPage({
  searchParams,
}: {
  searchParams?: Promise<{ prompt?: string }>;
}) {
  let prompt = "";
  try {
    const resolvedParams = searchParams ? await searchParams : undefined;
    if (resolvedParams && typeof resolvedParams.prompt === "string") {
      prompt = resolvedParams.prompt;
    }
  } catch {
    prompt = "";
  }

  let posts: Pick<Post, "id" | "title" | "platform">[] = [];
  try {
    const { supabase, workspaceId } = await getActiveWorkspace();
    const { data } = await supabase
      .from("posts")
      .select("id, title, platform")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      posts = data as Pick<Post, "id" | "title" | "platform">[];
    }
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error fetching posts for ImageStudioPage:", err);
  }

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
        posts={posts}
        initialPrompt={prompt}
      />
    </div>
  );
}
