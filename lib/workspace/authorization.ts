import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export function canManageWorkspace(role: UserRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageTeam(role: UserRole) {
  return role === "OWNER";
}

export async function requireWorkspaceRole(workspaceId: string, allowed: UserRole[]) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("id, workspace_id, user_id, role, created_at")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error || !membership || !allowed.includes(membership.role as UserRole)) {
    throw new Error("You do not have permission to perform this action.");
  }

  return { supabase, userId: auth.user.id, role: membership.role as UserRole, membership };
}
