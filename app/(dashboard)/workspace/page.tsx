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
    <div className="page animate-fade-up">
      <div className="mx-auto max-w-6xl space-y-10 pb-24">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
            ✦ Content Workspace
          </span>
          <h1 className="mt-2.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Brand Identity &amp; Content Engine
          </h1>
          <p className="mt-1.5 text-sm text-white/50 leading-relaxed max-w-2xl">
            Create a reusable brand identity, generate automated multi-day content, add your logo to every image, and send the finished batch to your calendar.
          </p>
        </div>
        <MarketingWorkspace workspace={workspace} canEdit={role === "OWNER" || role === "ADMIN"} />
      </div>
    </div>
  );
}

