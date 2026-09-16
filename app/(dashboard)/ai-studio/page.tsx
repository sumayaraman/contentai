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
            ✦ Create Content
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AI Content Studio</h1>
          <p className="mt-1 text-sm text-white/50 max-w-2xl">
            Turn your ideas into ready-to-publish social media copy with hooks, captions, calls-to-action, and optimized hashtags.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          AI Powered
        </div>
      </div>

      {/* AI Studio Component */}
      <AIStudio categories={(categories ?? []) as Category[]} />

      {/* History Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-h">
          <div>
            <p className="ai-tag">Workspace history</p>
            <h2 className="card-title" style={{ marginTop: 4, fontSize: 15 }}>Recent AI generations</h2>
            <p className="page-subtitle" style={{ marginTop: 2 }}>The latest structured content bundles generated in this workspace.</p>
          </div>
        </div>
        <div className="card-body">
          {!history?.length ? (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <p className="empty-title">No generations yet</p>
              <p className="empty-desc">Generate your first content bundle above.</p>
            </div>
          ) : (
            <div>
              {history.map((item) => {
                const input = safeParse(item.input);
                const output = safeParse(item.output);
                return (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${item.provider === 'mock' ? 'badge-warning' : 'badge-success'}`}>
                        {item.provider === 'mock' ? 'Demo' : item.provider}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>{item.generation_type}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {typeof input?.topic === 'string' ? input.topic : 'Content generation'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {typeof output?.caption === 'string' ? output.caption : 'Structured content bundle'}
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
