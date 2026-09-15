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
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ AI Visual Studio
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Image &amp; Video Studio</h1>
          <p className="mt-1 text-sm text-white/50">
            Synthesize high-fidelity promotional imagery and video clips directly from textual prompts.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          AI Powered Studio
        </div>
      </div>

      <ImageGenerator posts={posts} initialPrompt={prompt} />
    </div>
  );
}
