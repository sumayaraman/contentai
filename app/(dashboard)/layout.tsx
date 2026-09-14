import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { getWorkspaceOptions } from "@/lib/workspace/actions";
import { MobileNav } from "@/components/layout/mobile-nav";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let profile = null;
  let workspaceId = "e0000000-0000-4000-8000-000000000000";
  let workspaces: { id: string; name: string }[] = [];

  try {
    const userRes = await getCurrentUser();
    profile = userRes.profile;
  } catch (err: unknown) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("DashboardLayout getCurrentUser non-fatal error:", err);
  }

  try {
    const wsRes = await getActiveWorkspace();
    workspaceId = wsRes.workspaceId;
  } catch (err: unknown) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("DashboardLayout getActiveWorkspace non-fatal error:", err);
  }

  try {
    workspaces = await getWorkspaceOptions();
  } catch (err) {
    console.warn("DashboardLayout getWorkspaceOptions non-fatal error:", err);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="app-main">
        <Topbar profile={profile} workspaceId={workspaceId} workspaces={workspaces} />
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
