import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ProfileForm } from "@/components/ui/profile-form";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { WorkspaceSettings } from "@/components/workspace/workspace-settings";
import type { TeamMember } from "@/lib/workspace/types";
import { listSocialAccounts } from "@/lib/social/actions";
import { SocialAccounts } from "@/components/workspace/social-accounts";

export default async function SettingsPage() {
  const { profile } = await getCurrentUser();
  const { supabase, workspaceId, role, workspace } = await getActiveWorkspace();
  const { data: rows } = await supabase
    .from("workspace_members")
    .select("id, user_id, role, created_at, users!inner(id, email, name, avatar_url)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  const members = (rows ?? []).map((row) => ({
    membership_id: row.id,
    user_id: row.user_id,
    role: row.role,
    joined_at: row.created_at,
    profile: row.users as unknown as TeamMember["profile"],
  })) as TeamMember[];

  const socialAccounts = await listSocialAccounts(workspaceId);

  return (
    <div className="page animate-fade-up">
      <div className="page-header">
        <div>
          <p className="ai-tag" style={{ marginBottom: 6 }}>Workspace settings</p>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your profile, workspace, team access, AI preferences and simulated social connections.</p>
        </div>
      </div>

      {/* Profile */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <div>
            <div className="card-title">Profile</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Your profile information is stored in the ContentAI database.
            </p>
          </div>
        </div>
        <div className="card-body">
          <ProfileSection profile={profile} />
        </div>
      </div>

      <WorkspaceSettings workspace={workspace} role={role} members={members} />
      <SocialAccounts accounts={socialAccounts} role={role} />
    </div>
  );
}

function ProfileSection({ profile }: { profile: Awaited<ReturnType<typeof getCurrentUser>>["profile"] }) {
  return <ProfileForm profile={profile} />;
}
