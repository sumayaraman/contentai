import type { UserRole, UserProfile, Workspace } from "@/types/database";

export type WorkspaceMembership = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
};

export type WorkspaceWithRole = Workspace & { role: UserRole };

export type TeamMember = {
  membership_id: string;
  user_id: string;
  role: UserRole;
  joined_at: string;
  profile: Pick<UserProfile, "id" | "email" | "name" | "avatar_url">;
};
