import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { getWorkspaceOptions } from "@/lib/workspace/actions";
import { MobileNav } from "@/components/layout/mobile-nav";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentUser();
  const { workspaceId } = await getActiveWorkspace();
  const workspaces = await getWorkspaceOptions();
  return <div className="flex min-h-screen"><Sidebar /><div className="flex min-w-0 flex-1 flex-col lg:pl-[220px]"><Topbar profile={profile} workspaceId={workspaceId} workspaces={workspaces} /><main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6">{children}</main></div><MobileNav /></div>;
}
