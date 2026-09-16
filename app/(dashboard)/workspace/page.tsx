import { getActiveWorkspace } from "@/lib/content/workspace";
import { MarketingWorkspace } from "@/components/marketing/marketing-workspace";
import type { UserRole } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function WorkspacePage() {
  let workspace = { id: "", name: "Default Workspace", owner_id: "", created_at: "", updated_at: "", ai_provider: "auto" };
  let role: UserRole = "OWNER";

  try {
    const res = await getActiveWorkspace();
    workspace = res.workspace;
    role = res.role;
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in WorkspacePage:", err);
  }

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ 30-Day Content Workshop
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Plan your next 30 days</h1>
          <p className="mt-1 text-sm text-white/50">
            Generate a complete month of branded visual content with your logo, watermarked graphics, and automated calendar scheduling.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          Full Month Workshop
        </div>
      </div>

      {/* 5-Step Visual Workflow Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c16]/80 p-4 sm:p-5">
        <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
          30-Day Workshop Workflow
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
          {[
            { step: "1", title: "Brand & Logo", desc: "Upload logo & voice" },
            { step: "2", title: "Preferences", desc: "Topic, duration, niche" },
            { step: "3", title: "Generate Plan", desc: "AI creates post batch" },
            { step: "4", title: "Review & Edit", desc: "Customize hooks & copy" },
            { step: "5", title: "Schedule", desc: "Dispatch to calendar" },
          ].map((s) => (
            <div
              key={s.step}
              className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10.5px] font-bold text-violet-300 border border-violet-500/30">
                {s.step}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{s.title}</div>
                <div className="text-[10.5px] text-white/40 truncate">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MarketingWorkspace workspace={workspace} canEdit={role === "OWNER" || role === "ADMIN"} />
    </div>
  );
}

