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

  const steps = [
    { step: "1", label: "Brand & Logo" },
    { step: "2", label: "Preferences" },
    { step: "3", label: "Generate Plan" },
    { step: "4", label: "Review & Edit" },
    { step: "5", label: "Schedule" },
  ];

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            ✦ 30-Day Content Workshop
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Plan your next 30 days</h1>
          <p className="mt-1 text-sm text-white/50 max-w-2xl">
            Generate a complete branded visual content plan for your social media with your logo, custom watermarks, and unified brand style.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          Branded Studio Engine
        </div>
      </div>

      {/* 5-Step Workflow Roadmap Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c16]/80 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between overflow-x-auto gap-3 py-1">
          {steps.map((s, idx) => (
            <div key={s.step} className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 border border-violet-500/30 text-[11px] font-bold text-violet-300">
                  {s.step}
                </span>
                <span className="text-xs font-semibold text-white/80">{s.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <span className="text-white/20 hidden sm:inline">&rarr;</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <MarketingWorkspace workspace={workspace} canEdit={role === "OWNER" || role === "ADMIN"} />
    </div>
  );
}

