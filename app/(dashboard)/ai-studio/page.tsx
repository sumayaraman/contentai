import { AIStudio } from "@/components/ai/ai-studio";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Category } from "@/types/database";
import { Sparkles, History } from "lucide-react";

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
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-10 pb-36 pt-2">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2.5">
            <Sparkles size={13} /> AI Content Studio
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AI Content Studio</h1>
          <p className="mt-1.5 text-sm text-white/50 max-w-2xl leading-relaxed">
            Describe what you want to post about, and ContentAI will craft high-converting hooks, compelling captions, calls to action, and platform-tailored hashtags.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto shadow-sm">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          AI Powered Studio
        </div>
      </div>

      {/* AI Studio Component */}
      <AIStudio categories={(categories ?? []) as Category[]} />

      {/* Workspace History Section */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c16]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-white/[0.06]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-400 tracking-wide uppercase">
              <History size={13} /> Workspace History
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent AI Generations</h2>
            <p className="text-xs text-white/50">The latest structured content bundles generated in this workspace.</p>
          </div>
          <span className="text-xs text-white/40">{history.length} saved bundles</span>
        </div>

        <div>
          {!history?.length ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Sparkles size={20} />
              </div>
              <p className="text-sm font-semibold text-white">No generations yet</p>
              <p className="text-xs text-white/40 max-w-xs">Generate your first structured content bundle using the studio above.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((item) => {
                const input = safeParse(item.input);
                const output = safeParse(item.output);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] transition space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          item.provider === "mock"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                            : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                        }`}>
                          {item.provider === "mock" ? "Demo" : item.provider}
                        </span>
                        <span className="text-[11px] text-white/40">
                          {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white line-clamp-1">
                        {typeof input?.topic === "string" ? input.topic : "Content generation"}
                      </p>
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                        {typeof output?.caption === "string" ? output.caption : "Structured content bundle"}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/40">
                      <span className="capitalize">{item.generation_type?.toLowerCase() || "post"}</span>
                      {typeof output?.platform === "string" && (
                        <span className="text-violet-400 font-medium">{output.platform}</span>
                      )}
                    </div>
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
