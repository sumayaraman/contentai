import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getActiveWorkspace } from "@/lib/content/workspace";
import type { TeamMember } from "@/lib/workspace/types";
import { listSocialAccounts } from "@/lib/social/actions";
import type { UserProfile, UserRole } from "@/types/database";
import type { SocialAccount } from "@/lib/social/types";
import { SettingsContainer } from "@/components/settings/settings-container";

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
    <div className="page animate-fade-up">
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        {/* Header with generous spacing */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3.5 py-1 text-xs font-semibold text-violet-300">
            ✦ Preferences
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl pt-1">
            Settings
          </h1>
          <p className="text-sm text-white/50 leading-relaxed max-w-xl pt-0.5">
            Manage your personal profile, workspace details, team access, and AI preferences.
          </p>
        </div>

        <SettingsContainer
          profile={profile}
          workspace={workspace}
          role={role}
          members={members}
          socialAccounts={socialAccounts}
        />
      </div>
    </div>
  );
}
