"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceRole } from "@/lib/workspace/authorization";
import type { UserRole } from "@/types/database";
import { isUuid } from "@/lib/security/paths";

const WORKSPACE_COOKIE = "contentai_workspace_id";
const AI_PROVIDERS = new Set(["auto", "mock", "openai", "anthropic", "groq"]);

export async function getWorkspaceOptions() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces!inner(id, name, owner_id)")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: true });

  return (data ?? []).map((item) => {
    const workspace = item.workspaces as unknown as { id: string; name: string; owner_id: string };
    return { id: workspace.id, name: workspace.name, owner_id: workspace.owner_id, role: item.role as UserRole };
  });
}

export async function switchWorkspace(workspaceId: string) {
  if (!isUuid(workspaceId)) throw new Error("Invalid workspace.");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!membership) throw new Error("You do not have access to that workspace.");

  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspaceId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateWorkspace(workspaceId: string, name: string) {
  const { supabase } = await requireWorkspaceRole(workspaceId, ["OWNER", "ADMIN"]);
  const cleanName = name.trim();
  if (cleanName.length < 1 || cleanName.length > 120) return { error: "Workspace name must be between 1 and 120 characters." };

  const { error } = await supabase.from("workspaces").update({ name: cleanName }).eq("id", workspaceId);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/dashboard", "layout");
  return { error: null };
}

export async function updatePreferredAIProvider(workspaceId: string, provider: string) {
  const { supabase } = await requireWorkspaceRole(workspaceId, ["OWNER", "ADMIN"]);
  if (!AI_PROVIDERS.has(provider)) return { error: "Invalid AI provider." };
  const { error } = await supabase.from("workspaces").update({ ai_provider: provider }).eq("id", workspaceId);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { error: null };
}

export async function updateMemberRole(workspaceId: string, membershipId: string, role: Exclude<UserRole, "OWNER">) {
  const { supabase } = await requireWorkspaceRole(workspaceId, ["OWNER"]);
  if (role !== "ADMIN" && role !== "MEMBER") return { error: "Invalid role." };

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("id", membershipId)
    .eq("workspace_id", workspaceId)
    .neq("role", "OWNER");

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { error: null };
}

export async function removeMember(workspaceId: string, membershipId: string) {
  const { supabase } = await requireWorkspaceRole(workspaceId, ["OWNER"]);

  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("id, user_id, role")
    .eq("id", membershipId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (memberError || !member) return { error: "Member not found." };
  if (member.role === "OWNER") return { error: "The workspace owner cannot be removed." };

  const { error } = await supabase.from("workspace_members").delete().eq("id", membershipId).eq("workspace_id", workspaceId);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { error: null };
}
