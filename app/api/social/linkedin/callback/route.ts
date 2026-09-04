import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consumeOAuthState } from "@/lib/social/oauth";
import { LinkedInPublisher } from "@/lib/social/providers/linkedin";
import { saveSocialAccount } from "@/lib/social/service";

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const state = url.searchParams.get("state"); const base = new URL("/settings", request.url);
  if (!code || !state) { base.searchParams.set("social","oauth-error"); return NextResponse.redirect(base); }
  const saved = await consumeOAuthState("linkedin", state);
  if (!saved) { base.searchParams.set("social","invalid-state"); return NextResponse.redirect(base); }
  const { data: auth } = await (await createClient()).auth.getUser();
  if (!auth.user || auth.user.id !== saved.userId) { base.searchParams.set("social","unauthorized"); return NextResponse.redirect(base); }
  try {
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || new URL("/api/social/linkedin/callback", request.url).toString();
    const token = await fetch("https://www.linkedin.com/oauth/v2/accessToken", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({grant_type:"authorization_code",code,redirect_uri:redirectUri,client_id:process.env.LINKEDIN_CLIENT_ID!,client_secret:process.env.LINKEDIN_CLIENT_SECRET!}), cache:"no-store" });
    if (!token.ok) throw new Error("LinkedIn authorization failed.");
    const data = await token.json() as {access_token:string; expires_in:number};
    const member = await new LinkedInPublisher().getMember(data.access_token);
    await saveSocialAccount({workspaceId:saved.workspaceId,userId:saved.userId,platform:"LINKEDIN",accountId:member.sub,accountName:member.name || "LinkedIn member",username:member.email || null,accessToken:data.access_token,tokenExpiresAt:new Date(Date.now()+data.expires_in*1000).toISOString(),scopes:["openid","profile","email","w_member_social"]});
    base.searchParams.set("social","connected");
  } catch { base.searchParams.set("social","error"); }
  return NextResponse.redirect(base);
}
