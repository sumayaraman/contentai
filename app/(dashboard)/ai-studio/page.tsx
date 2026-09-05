import { AIStudio } from "@/components/ai/ai-studio";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Category } from "@/types/database";

export default async function AIStudioPage() {
  const { supabase, workspaceId } = await getActiveWorkspace();

  const [{ data: categories, error: categoriesError }, { data: history, error: historyError }, { data: posts, error: postsError }] = await Promise.all([
    supabase.from("categories").select("id, workspace_id, name, color, created_at").eq("workspace_id", workspaceId).order("name"),
    supabase.from("ai_generations").select("id, workspace_id, user_id, generation_type, input, output, provider, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(12),
    supabase.from("posts").select("id, title, platform").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50),
  ]);

  if (categoriesError) throw new Error(categoriesError.message);
  if (historyError) throw new Error(historyError.message);
  if (postsError) throw new Error(postsError.message);

  return (
    <div className="page animate-fade-up">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="ai-tag" style={{ marginBottom: 6 }}>✦ AI Studio</p>
          <h1 className="page-title">Create better content, faster</h1>
          <p className="page-subtitle">
            Generate structured social content from one brief. Your API key stays server-side, and Demo Mode keeps the studio usable without an AI provider.
          </p>
        </div>
        <span className="badge badge-ai">
          <span className="ai-dot" style={{ width: 5, height: 5 }} />
          AI Powered
        </span>
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
