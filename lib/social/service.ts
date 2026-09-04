import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptSecret, encryptSecret } from "@/lib/social/crypto";
import { MetaSocialPublisher } from "@/lib/social/providers/meta";
import { LinkedInPublisher } from "@/lib/social/providers/linkedin";
import { XPublisher } from "@/lib/social/providers/x";
import type { Platform } from "@/types/database";
import type { SocialAccount, SocialPublishInput, SocialPublishResult } from "@/lib/social/types";

export async function saveSocialAccount(input: {
  workspaceId: string; userId: string; platform: Platform; accountId: string; accountName: string; username?: string | null;
  accessToken: string; refreshToken?: string | null; tokenExpiresAt?: string | null; scopes?: string[]; metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const secret = encryptSecret(JSON.stringify({ accessToken: input.accessToken, refreshToken: input.refreshToken ?? null, expiresAt: input.tokenExpiresAt ?? null }));
  const { data, error } = await supabase.from("social_accounts").upsert({
    workspace_id: input.workspaceId, connected_by: input.userId, platform: input.platform, account_id: input.accountId,
    account_name: input.accountName, username: input.username ?? null, access_token_encrypted: secret,
    refresh_token_encrypted: input.refreshToken ? encryptSecret(input.refreshToken) : null,
    token_expires_at: input.tokenExpiresAt ?? null, scopes: input.scopes ?? [], metadata: input.metadata ?? {},
  }, { onConflict: "workspace_id,platform,account_id" }).select("id,workspace_id,connected_by,platform,account_id,account_name,username,scopes,token_expires_at,metadata,created_at,updated_at").single();
  if (error) { console.error(error); return []; }
  return data as SocialAccount;
}

export async function getSocialAccounts(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("social_accounts").select("id,workspace_id,connected_by,platform,account_id,account_name,username,scopes,token_expires_at,metadata,created_at,updated_at").eq("workspace_id", workspaceId).order("platform");
  if (error) { console.error(error); return []; }
  return (data ?? []) as SocialAccount[];
}

async function getAccountSecret(accountId: string, workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("social_accounts").select("id,platform,access_token_encrypted,refresh_token_encrypted,token_expires_at,metadata").eq("id", accountId).eq("workspace_id", workspaceId).maybeSingle();
  if (error || !data) throw new Error("Social account not found in this workspace.");
  const secret = JSON.parse(decryptSecret(data.access_token_encrypted)) as { accessToken: string; refreshToken?: string | null; expiresAt?: string | null };
  return { supabase, data, secret };
}

export async function disconnectSocialAccount(accountId: string, workspaceId: string) {
  const { supabase, data, secret } = await getAccountSecret(accountId, workspaceId);
  try {
    if (data.platform === "X" && process.env.X_CLIENT_ID) {
      await fetch("https://api.x.com/2/oauth2/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: secret.accessToken, client_id: process.env.X_CLIENT_ID }),
        cache: "no-store",
      }).catch(() => undefined);
    }
  } finally {
    const { error } = await supabase.from("social_accounts").delete().eq("id", accountId).eq("workspace_id", workspaceId);
    if (error) { console.error(error); return []; }
  }
}

async function resolvePublishImageUrl(supabase: SupabaseClient, workspaceId: string, imageUrl: string | null) {
  if (!imageUrl) return null;
  const match = imageUrl.match(/\/api\/media\/([0-9a-f-]{36})/i);
  if (!match) return imageUrl;
  const { data: media } = await supabase.from("media").select("storage_path").eq("id", match[1]).eq("workspace_id", workspaceId).maybeSingle();
  if (!media?.storage_path) return null;
  const { data: signed } = await supabase.storage.from("media").createSignedUrl(media.storage_path, 300);
  return signed?.signedUrl ?? null;
}

export async function publishToSocialAccount(accountId: string, workspaceId: string, input: SocialPublishInput): Promise<SocialPublishResult> {
  const { data, secret } = await getAccountSecret(accountId, workspaceId);
  let token = secret.accessToken;
  const expiresSoon = secret.expiresAt ? new Date(secret.expiresAt).getTime() <= Date.now() + 60_000 : false;
  if (expiresSoon && data.platform === "X" && secret.refreshToken && process.env.X_CLIENT_ID) {
    const response = await fetch("https://api.x.com/2/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ refresh_token: secret.refreshToken, grant_type: "refresh_token", client_id: process.env.X_CLIENT_ID }),
      cache: "no-store",
    });
    if (response.ok) {
      const refreshed = await response.json() as { access_token: string; refresh_token?: string; expires_in?: number };
      token = refreshed.access_token;
      const supabase = await createClient();
      await supabase.from("social_accounts").update({
        access_token_encrypted: encryptSecret(JSON.stringify({
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? secret.refreshToken,
          expiresAt: refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : null,
        })),
        refresh_token_encrypted: refreshed.refresh_token ? encryptSecret(refreshed.refresh_token) : data.refresh_token_encrypted,
        token_expires_at: refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : null,
      }).eq("id", accountId).eq("workspace_id", workspaceId);
    } else {
      return { success: false, externalPostId: null, message: "X connection has expired. Please reconnect it.", errorCode: "X_REAUTH_REQUIRED", requiresReauth: true };
    }
  } else if (expiresSoon && data.platform === "LINKEDIN") {
    return { success: false, externalPostId: null, message: "LinkedIn connection has expired. Please reconnect it.", errorCode: "LINKEDIN_REAUTH_REQUIRED", requiresReauth: true };
  }
  const publishInput = { ...input, imageUrl: await resolvePublishImageUrl(await createClient(), workspaceId, input.imageUrl) };
  switch (data.platform as Platform) {
    case "LINKEDIN": return new LinkedInPublisher().publish(publishInput, token);
    case "X": return new XPublisher().publish(publishInput, token);
    case "FACEBOOK": {
      const pageId = String((data.metadata as Record<string, unknown>).page_id || data.account_id);
      return new MetaSocialPublisher().publishFacebook(publishInput, { id: pageId, access_token: token });
    }
    case "INSTAGRAM": {
      const pageId = String((data.metadata as Record<string, unknown>).page_id || "");
      if (!pageId) return { success: false, externalPostId: null, message: "Instagram connection is missing its Meta Page association.", errorCode: "INSTAGRAM_PAGE_MISSING" };
      return new MetaSocialPublisher().publishInstagram(publishInput, { id: pageId, access_token: token }, data.account_id);
    }
  }
}
