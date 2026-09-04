import { AIStudio } from "@/components/ai/ai-studio";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { Category, Post } from "@/types/database";

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

  return <div className="mx-auto max-w-7xl space-y-6">
    <div><p className="text-sm font-medium text-blue-600">AI Studio</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Create better content, faster</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Generate structured social content from one brief. Your API key stays server-side, and Demo Mode keeps the studio usable without an AI provider.</p></div>
    <AIStudio categories={(categories ?? []) as Category[]} />
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workspace history</p><h2 className="mt-1 text-lg font-bold text-slate-950">Recent AI generations</h2><p className="mt-1 text-sm text-slate-500">The latest structured content bundles generated in this workspace.</p></div>{!history?.length ? <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">No generations yet. Generate your first content bundle above.</div> : <div className="mt-5 divide-y divide-slate-100">{history.map((item) => { const input = safeParse(item.input); const output = safeParse(item.output); return <div key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${item.provider === "mock" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{item.provider === "mock" ? "Demo" : item.provider}</span><span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</span></div><p className="mt-2 truncate text-sm font-semibold text-slate-900">{typeof input?.topic === "string" ? input.topic : "Content generation"}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{typeof output?.caption === "string" ? output.caption : "Structured content bundle"}</p></div><div className="shrink-0 text-xs font-medium text-slate-400">{item.generation_type}</div></div>; })}</div>}</section>
  </div>;
}

function safeParse(value: string | null) { if (!value) return null; try { return JSON.parse(value) as Record<string, unknown>; } catch { return null; } }



