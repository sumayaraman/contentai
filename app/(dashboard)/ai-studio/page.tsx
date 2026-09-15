import { AIStudio } from "@/components/ai/ai-studio";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Category } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function AIStudioPage() {
  let categories: Category[] = [];
  let history: Array<{ id: string; workspace_id: string; user_id: string; generation_type: string; input: string | null; output: string | null; provider: string; created_at: string }> = [];

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();

    const [{ data: cats }, { data: historyData }] = await Promise.all([
      supabase.from("categories").select("id, workspace_id, name, color, created_at").eq("workspace_id", workspaceId).order("name"),
      supabase.from("ai_generations").select("id, workspace_id, user_id, generation_type, input, output, provider, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(12),
    ]);
    if (cats) categories = cats as Category[];
    if (historyData) history = historyData as typeof history;
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in AIStudioPage:", err);
  }


  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ AI Copy Studio
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AI Content Generator</h1>
          <p className="mt-1 text-sm text-white/50">
            Generate high-performing social copy from a single brief. Produces structured hooks, captions, calls-to-action, hashtags, and visual prompts.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          AI Powered Studio
        </div>
      </div>

      {/* AI Studio Component */}
      <AIStudio categories={(categories ?? []) as Category[]} />

      {/* History Section */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="mb-5 border-b border-white/[0.06] pb-4">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-400">
            Workspace History
          </div>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-white">Recent AI Generations</h2>
          <p className="mt-0.5 text-xs text-white/50">The latest structured content bundles generated in this workspace.</p>
        </div>

        <div>
          {!history?.length ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] py-12 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                ✦
              </div>
              <p className="mt-3 text-sm font-semibold text-white">No generations yet</p>
              <p className="mt-1 text-xs text-white/40">Generate your first content bundle using the brief form above.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {history.map((item) => {
                const input = safeParse(item.input);
                const output = safeParse(item.output);
                return (
                  <div key={item.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          item.provider === "mock"
                            ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                            : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        {item.provider === "mock" ? "Demo" : item.provider}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <span className="ml-auto text-[11px] text-white/30 uppercase tracking-wider font-mono">
                        {item.generation_type}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {typeof input?.topic === "string" ? input.topic : "Content generation"}
                    </p>
                    <p className="line-clamp-2 text-xs text-white/60 leading-relaxed">
                      {typeof output?.caption === "string" ? output.caption : "Structured content bundle"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function safeParse(value: string | null) {
  if (!value) return null;
  try { return JSON.parse(value) as Record<string, unknown>; }
  catch { return null; }
}
