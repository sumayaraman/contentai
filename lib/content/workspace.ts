import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminClientOrNull } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";
import { isUuid } from "@/lib/security/paths";

const WORKSPACE_COOKIE = "contentai_workspace_id";
export const DEFAULT_FALLBACK_WORKSPACE_ID = "e0000000-0000-4000-8000-000000000000";

interface WorkspaceRecord {
  id: string;
  name: string;
  owner_id: string;
  ai_provider: string;
  brand_name: string | null;
  brand_description: string | null;
  brand_logo_url: string | null;
  brand_primary_color: string | null;
  brand_secondary_color: string | null;
  brand_voice: string | null;
  created_at: string;
  updated_at: string;
}

function normalizeWorkspace(raw: Partial<WorkspaceRecord> | null | undefined, fallbackOwnerId: string): WorkspaceRecord {
  return {
    id: raw?.id || DEFAULT_FALLBACK_WORKSPACE_ID,
    name: raw?.name || "Coffee Studio",
    owner_id: raw?.owner_id || fallbackOwnerId,
    ai_provider: raw?.ai_provider || "auto",
    brand_name: raw?.brand_name ?? raw?.name ?? "Coffee Studio",
    brand_description: raw?.brand_description ?? null,
    brand_logo_url: raw?.brand_logo_url ?? null,
    brand_primary_color: raw?.brand_primary_color ?? "#111827",
    brand_secondary_color: raw?.brand_secondary_color ?? "#f59e0b",
    brand_voice: raw?.brand_voice ?? "Friendly and professional",
    created_at: raw?.created_at || new Date().toISOString(),
    updated_at: raw?.updated_at || new Date().toISOString(),
  };
}

export async function getActiveWorkspace() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");

  const userId = authData.user.id;
  const cookieStore = await cookies();
  const rawPreferredId = cookieStore.get(WORKSPACE_COOKIE)?.value;
  const preferredId = rawPreferredId && isUuid(rawPreferredId) ? rawPreferredId : undefined;

  // 1. Try querying existing membership with full brand columns
  try {
    let query = supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(id, name, owner_id, ai_provider, brand_name, brand_description, brand_logo_url, brand_primary_color, brand_secondary_color, brand_voice, created_at, updated_at)")
      .eq("user_id", userId);

    if (preferredId) query = query.eq("workspace_id", preferredId);
    else query = query.order("created_at", { ascending: true }).limit(1);

    const { data: membership, error } = await query.maybeSingle();

    if (!error && membership && membership.workspaces) {
      return {
        supabase,
        userId,
        workspaceId: membership.workspace_id,
        role: (membership.role || "OWNER") as UserRole,
        workspace: normalizeWorkspace(membership.workspaces, userId),
      };
    }
  } catch (e) {
    console.warn("Full workspace query failed, attempting simplified query:", e);
  }

  // 2. Fallback: try querying base workspace columns (in case brand migrations haven't run)
  try {
    let query = supabase
      .from("workspace_members")
      .select("workspace_id, role, workspaces(id, name, owner_id, created_at, updated_at)")
      .eq("user_id", userId);

    if (preferredId) query = query.eq("workspace_id", preferredId);
    else query = query.order("created_at", { ascending: true }).limit(1);

    const { data: membership, error } = await query.maybeSingle();

    if (!error && membership && membership.workspaces) {
      return {
        supabase,
        userId,
        workspaceId: membership.workspace_id,
        role: (membership.role || "OWNER") as UserRole,
        workspace: normalizeWorkspace(membership.workspaces, userId),
      };
    }
  } catch (e) {
    console.warn("Simplified workspace query failed:", e);
  }

  // 3. User has no workspace membership yet -> Auto-create / Self-heal
  const admin = getAdminClientOrNull();
  const clientToUse = admin || supabase;

  try {
    const email = authData.user.email ?? "";
    const name =
      (authData.user.user_metadata?.name as string | undefined) ||
      (authData.user.user_metadata?.full_name as string | undefined) ||
      (email ? email.split("@")[0] : "Marketing");

    // Ensure public.users entry
    try {
      await clientToUse
        .from("users")
        .upsert({ id: userId, email, name }, { onConflict: "id" });
    } catch {}

    // Check if user owns an existing workspace
    let { data: existingWs } = await clientToUse
      .from("workspaces")
      .select("id, name, owner_id, created_at, updated_at")
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle();

    if (!existingWs) {
      const { data: createdWs } = await clientToUse
        .from("workspaces")
        .insert({
          name: `${name}'s Workspace`,
          owner_id: userId,
        })
        .select("id, name, owner_id, created_at, updated_at")
        .maybeSingle();
      if (createdWs) existingWs = createdWs;
    }

    if (existingWs) {
      // Add membership
      try {
        await clientToUse
          .from("workspace_members")
          .upsert(
            { workspace_id: existingWs.id, user_id: userId, role: "OWNER" },
            { onConflict: "workspace_id,user_id" }
          );
      } catch {}

      try {
        cookieStore.set(WORKSPACE_COOKIE, existingWs.id, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
      } catch {}

      return {
        supabase,
        userId,
        workspaceId: existingWs.id,
        role: "OWNER" as UserRole,
        workspace: normalizeWorkspace(existingWs, userId),
      };
    }
  } catch (e) {
    console.error("Auto-provisioning workspace failed:", e);
  }

  // 4. Safe fallback workspace: ensure the page NEVER crashes
  const fallbackWs = normalizeWorkspace(
    {
      id: DEFAULT_FALLBACK_WORKSPACE_ID,
      name: "My Marketing Workspace",
      owner_id: userId,
    },
    userId
  );

  return {
    supabase,
    userId,
    workspaceId: fallbackWs.id,
    role: "OWNER" as UserRole,
    workspace: fallbackWs,
  };
}
