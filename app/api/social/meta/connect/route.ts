import { NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { createOAuthState } from "@/lib/social/oauth";

export async function GET(request: Request) {
  const { workspaceId, userId, role } = await getActiveWorkspace();
  if (role === "MEMBER") return NextResponse.json({ error: "Only workspace owners and admins can connect social accounts." }, { status: 403 });
  if (!process.env.META_CLIENT_ID || !process.env.META_CLIENT_SECRET) return NextResponse.redirect(new URL("/settings?social=not-configured", request.url));
  const state = await createOAuthState("meta", { workspaceId, userId });
  const redirectUri = process.env.META_REDIRECT_URI || new URL("/api/social/meta/callback", request.url).toString();
  const params = new URLSearchParams({ client_id: process.env.META_CLIENT_ID, redirect_uri: redirectUri, state, response_type: "code", scope: "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish" });
  return NextResponse.redirect(`https://www.facebook.com/dialog/oauth?${params.toString()}`);
}
