import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import { isUuid } from "@/lib/security/paths";

const WORKSPACE_COOKIE = "contentai_workspace_id";

export async function getActiveWorkspace() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");

  const cookieStore = await cookies();
  const rawPreferredId = cookieStore.get(WORKSPACE_COOKIE)?.value;
  const preferredId = rawPreferredId && isUuid(rawPreferredId) ? rawPreferredId : undefined;

  let query = supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces!inner(id, name, owner_id, ai_provider, created_at, updated_at)")
    .eq("user_id", authData.user.id);

  if (preferredId) query = query.eq("workspace_id", preferredId);
  else query = query.order("created_at", { ascending: true }).limit(1);

  let { data: membership, error } = await query.maybeSingle();

  if ((!membership || error) && preferredId) {
    const fallback = await supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces!inner(id, name, owner_id, ai_provider, created_at, updated_at)")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    membership = fallback.data;
    error = fallback.error;
  }

  if (error || !membership) throw new Error("No workspace is available for this account.");

  const workspace = membership.workspaces as unknown as { id: string; name: string; owner_id: string; ai_provider: string; created_at: string; updated_at: string };
  return {
    supabase,
    userId: authData.user.id,
    workspaceId: membership.workspace_id,
    role: membership.role as UserRole,
    workspace,
  };
}
