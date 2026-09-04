import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consumeOAuthState } from "@/lib/social/oauth";
import { MetaSocialPublisher } from "@/lib/social/providers/meta";
import { saveSocialAccount } from "@/lib/social/service";

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const state = url.searchParams.get("state");
  const base = new URL("/settings", request.url);
  if (!code || !state) { base.searchParams.set("social", "oauth-error"); return NextResponse.redirect(base); }
  const saved = await consumeOAuthState("meta", state);
  if (!saved) { base.searchParams.set("social", "invalid-state"); return NextResponse.redirect(base); }
  const { data: auth } = await (await createClient()).auth.getUser();
  if (!auth.user || auth.user.id !== saved.userId) { base.searchParams.set("social", "unauthorized"); return NextResponse.redirect(base); }
  try {
    const redirectUri = process.env.META_REDIRECT_URI || new URL("/api/social/meta/callback", request.url).toString();
    const tokenResponse = await fetch(`https://graph.facebook.com/oauth/access_token?${new URLSearchParams({ client_id: process.env.META_CLIENT_ID!, client_secret: process.env.META_CLIENT_SECRET!, redirect_uri: redirectUri, code })}`, { cache: "no-store" });
    if (!tokenResponse.ok) throw new Error("Meta authorization failed.");
    const token = await tokenResponse.json() as { access_token: string; expires_in?: number };
    const publisher = new MetaSocialPublisher(); const pages = await publisher.getPages(token.access_token);
    if (!pages.length) throw new Error("No Facebook Page was granted to this ContentAI connection.");
    for (const page of pages) {
      await saveSocialAccount({ workspaceId: saved.workspaceId, userId: saved.userId, platform: "FACEBOOK", accountId: page.id, accountName: page.name, accessToken: page.access_token, tokenExpiresAt: token.expires_in ? new Date(Date.now()+token.expires_in*1000).toISOString() : null, scopes: ["pages_manage_posts","pages_read_engagement"], metadata: { page_id: page.id } });
      if (page.instagram_business_account?.id) {
        await saveSocialAccount({ workspaceId: saved.workspaceId, userId: saved.userId, platform: "INSTAGRAM", accountId: page.instagram_business_account.id, accountName: `${page.name} Instagram`, accessToken: page.access_token, tokenExpiresAt: token.expires_in ? new Date(Date.now()+token.expires_in*1000).toISOString() : null, scopes: ["instagram_basic","instagram_content_publish"], metadata: { page_id: page.id, facebook_page_id: page.id } });
      }
    }
    base.searchParams.set("social", "connected");
  } catch (error) { base.searchParams.set("social", error instanceof Error ? "error" : "oauth-error"); }
  return NextResponse.redirect(base);
}
