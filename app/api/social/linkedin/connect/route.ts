import { NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { createOAuthState } from "@/lib/social/oauth";

export async function GET(request: Request) {
  const { workspaceId, userId, role } = await getActiveWorkspace();
  if (role === "MEMBER") return NextResponse.json({ error: "Only workspace owners and admins can connect social accounts." }, { status: 403 });
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) return NextResponse.redirect(new URL("/settings?social=not-configured", request.url));
  const state = await createOAuthState("linkedin", { workspaceId, userId });
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || new URL("/api/social/linkedin/callback", request.url).toString();
  const params = new URLSearchParams({ response_type: "code", client_id: process.env.LINKEDIN_CLIENT_ID, redirect_uri: redirectUri, state, scope: "openid profile email w_member_social" });
  return NextResponse.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
}
