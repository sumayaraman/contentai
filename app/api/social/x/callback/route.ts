import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consumeOAuthState } from "@/lib/social/oauth";
import { XPublisher } from "@/lib/social/providers/x";
import { saveSocialAccount } from "@/lib/social/service";

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const state = url.searchParams.get("state"); const base = new URL("/settings", request.url);
  if (!code || !state) { base.searchParams.set("social","oauth-error"); return NextResponse.redirect(base); }
  const saved = await consumeOAuthState("x", state);
  if (!saved?.codeVerifier) { base.searchParams.set("social","invalid-state"); return NextResponse.redirect(base); }
  const { data: auth } = await (await createClient()).auth.getUser();
  if (!auth.user || auth.user.id !== saved.userId) { base.searchParams.set("social","unauthorized"); return NextResponse.redirect(base); }
  try {
    const redirectUri = process.env.X_REDIRECT_URI || new URL("/api/social/x/callback", request.url).toString();
    const response = await fetch("https://api.x.com/2/oauth2/token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({code,grant_type:"authorization_code",client_id:process.env.X_CLIENT_ID!,redirect_uri:redirectUri,code_verifier:saved.codeVerifier}), cache:"no-store" });
    if (!response.ok) throw new Error("X authorization failed.");
    const data = await response.json() as {access_token:string;refresh_token?:string;expires_in?:number;scope?:string};
    const user = await new XPublisher().getUser(data.access_token);
    await saveSocialAccount({workspaceId:saved.workspaceId,userId:saved.userId,platform:"X",accountId:user.data.id,accountName:user.data.name,username:user.data.username,accessToken:data.access_token,refreshToken:data.refresh_token,tokenExpiresAt:data.expires_in ? new Date(Date.now()+data.expires_in*1000).toISOString() : null,scopes:data.scope?.split(" ")});
    base.searchParams.set("social","connected");
  } catch { base.searchParams.set("social","error"); }
  return NextResponse.redirect(base);
}
