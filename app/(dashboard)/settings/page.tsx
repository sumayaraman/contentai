import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ProfileForm } from "@/components/ui/profile-form";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { WorkspaceSettings } from "@/components/workspace/workspace-settings";
import type { TeamMember } from "@/lib/workspace/types";
import { listSocialAccounts } from "@/lib/social/actions";
import { SocialAccounts } from "@/components/workspace/social-accounts";
import type { UserProfile, UserRole } from "@/types/database";
import type { SocialAccount } from "@/lib/social/types";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

export default async function SettingsPage() {
  let profile: UserProfile | null = null;
  let workspace = { id: "", name: "Default Workspace", owner_id: "", created_at: "", updated_at: "", ai_provider: "auto" };
  let role: UserRole = "OWNER";
  let members: TeamMember[] = [];
  let socialAccounts: SocialAccount[] = [];

  try {
    const userRes = await getCurrentUser();
    profile = userRes.profile;
    const wsRes = await getActiveWorkspace();
    workspace = wsRes.workspace;
    role = wsRes.role;

    const { data: rows } = await wsRes.supabase
      .from("workspace_members")
      .select("id, user_id, role, created_at, users!inner(id, email, name, avatar_url)")
      .eq("workspace_id", wsRes.workspaceId)
      .order("created_at", { ascending: true });

    if (rows) {
      members = rows.map((row) => ({
        membership_id: row.id,
        user_id: row.user_id,
        role: row.role,
        joined_at: row.created_at,
        profile: row.users as unknown as TeamMember["profile"],
      })) as TeamMember[];
    }

    socialAccounts = await listSocialAccounts(wsRes.workspaceId);
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in SettingsPage:", err);
  }

  return (
    <div className="page animate-fade-up max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">
            Workspace settings
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Settings</h1>
          <p className="mt-1 text-xs text-white/50">Manage your personal profile, workspace details, team access, and AI preferences.</p>
        </div>
      </div>

      {/* Profile */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 p-6 backdrop-blur-xl shadow-xl">
        <div className="mb-5 pb-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Personal Profile</h2>
          <p className="mt-0.5 text-[11px] text-white/50">
            Your name and avatar appear across post revisions and workspace activity.
          </p>
        </div>
        <ProfileForm profile={profile} />
      </div>

      <WorkspaceSettings workspace={workspace} role={role} members={members} />
      <SocialAccounts accounts={socialAccounts} role={role} />
    </div>
  );
}

