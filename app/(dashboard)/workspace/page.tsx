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
            ✦ Content Workspace
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Brand Identity &amp; Content Engine</h1>
          <p className="mt-1 text-sm text-white/50">
            Create a reusable brand identity, generate automated multi-day content, add your logo to every image, and send the finished batch to your calendar.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          AI Powered Studio
        </div>
      </div>
      <MarketingWorkspace workspace={workspace} canEdit={role === "OWNER" || role === "ADMIN"} />
    </div>
  );
}

