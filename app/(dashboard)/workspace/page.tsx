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
      <div className="page-header">
        <div>
          <p className="ai-tag" style={{ marginBottom: 6 }}>✦ Marketing Workspace</p>
          <h1 className="page-title">Your brand → a month of content</h1>
          <p className="page-subtitle">Create a reusable brand identity, generate daily content, add your logo to every image, and send the finished batch to your calendar.</p>
        </div>
      </div>
      <MarketingWorkspace workspace={workspace} canEdit={role === "OWNER" || role === "ADMIN"} />
    </div>
  );
}

