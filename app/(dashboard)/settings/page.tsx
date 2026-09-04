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
  return <div className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-sm font-medium text-blue-600">Workspace settings</p><h1 className="mt-1 text-2xl font-bold text-slate-950">Settings</h1><p className="mt-1 text-sm text-slate-500">Manage your profile, workspace, team access, AI preferences and simulated social connections.</p></div>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-950">Profile</h2><p className="mt-1 text-sm text-slate-500">Your profile information is stored in the ContentAI database.</p><div className="mt-6"><ProfileSection profile={profile} /></div></section>
    <WorkspaceSettings workspace={workspace} role={role} members={members} />
    <SocialAccounts accounts={socialAccounts} role={role} />
  </div>;
}

function ProfileSection({ profile }: { profile: Awaited<ReturnType<typeof getCurrentUser>>["profile"] }) {
  return <ProfileForm profile={profile} />;
}
