import { NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { createOAuthState, pkceChallenge, pkceVerifier } from "@/lib/social/oauth";

export async function GET(request: Request) {
  const { workspaceId, userId, role } = await getActiveWorkspace();
  if (role === "MEMBER") return NextResponse.json({ error: "Only workspace owners and admins can connect social accounts." }, { status: 403 });
  if (!process.env.X_CLIENT_ID || !process.env.X_CLIENT_SECRET) return NextResponse.redirect(new URL("/settings?social=not-configured", request.url));
  const verifier = pkceVerifier(); const state = await createOAuthState("x", { workspaceId, userId, codeVerifier: verifier });
  const redirectUri = process.env.X_REDIRECT_URI || new URL("/api/social/x/callback", request.url).toString();
  const params = new URLSearchParams({ response_type:"code", client_id:process.env.X_CLIENT_ID, redirect_uri:redirectUri, scope:"tweet.read tweet.write users.read offline.access", state, code_challenge:pkceChallenge(verifier), code_challenge_method:"S256" });
  return NextResponse.redirect(`https://x.com/i/oauth2/authorize?${params.toString()}`);
}
