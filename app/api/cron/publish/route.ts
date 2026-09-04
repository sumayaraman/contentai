import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret, encryptSecret } from "@/lib/social/crypto";
import { MetaSocialPublisher } from "@/lib/social/providers/meta";
import { LinkedInPublisher } from "@/lib/social/providers/linkedin";
import { XPublisher } from "@/lib/social/providers/x";
import type { Platform } from "@/types/database";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data: posts, error } = await supabase.from("posts")
    .select("id,workspace_id,title,caption,image_url,platform,scheduled_at,status")
    .eq("status","SCHEDULED").lte("scheduled_at",now).order("scheduled_at",{ascending:true}).limit(50);
  if (error) return NextResponse.json({ error: "Could not load scheduled posts." }, { status: 500 });

  let processed = 0, succeeded = 0, failed = 0;
  for (const post of posts ?? []) {
    const { data: accounts } = await supabase.from("social_accounts").select("id,platform,account_id,access_token_encrypted,metadata").eq("workspace_id",post.workspace_id).eq("platform",post.platform);
    for (const account of accounts ?? []) {
      const { data: existing } = await supabase.from("post_publications").select("id,status,attempt_count").eq("post_id",post.id).eq("social_account_id",account.id).maybeSingle();
      if (existing?.status === "PUBLISHED") continue;
      const attempt = existing?.attempt_count ?? 0;
      if (attempt >= 3) continue;
      let publicationId = existing?.id;
      if (!publicationId) {
        const { data: created } = await supabase.from("post_publications").insert({workspace_id:post.workspace_id,post_id:post.id,social_account_id:account.id,platform:post.platform,status:"PUBLISHING",attempt_count:1}).select("id").single();
        publicationId = created?.id;
      } else {
        const { data: claimed } = await supabase.from("post_publications").update({status:"PUBLISHING",attempt_count:attempt+1,error_message:null}).eq("id",publicationId).eq("status","FAILED").select("id").maybeSingle();
        if (!claimed) continue;
      }
      if (!publicationId) continue;
      processed++;
      try {
        const secret = JSON.parse(decryptSecret(account.access_token_encrypted)) as {accessToken:string;refreshToken?:string|null;expiresAt?:string|null};
        let accessToken = secret.accessToken;
        if (post.platform === "X" && secret.refreshToken && secret.expiresAt && new Date(secret.expiresAt).getTime() <= Date.now() + 60000 && process.env.X_CLIENT_ID) {
          const refresh = await fetch("https://api.x.com/2/oauth2/token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({refresh_token:secret.refreshToken,grant_type:"refresh_token",client_id:process.env.X_CLIENT_ID}), cache:"no-store" });
          if (refresh.ok) {
            const refreshed = await refresh.json() as {access_token:string;refresh_token?:string;expires_in?:number};
            accessToken = refreshed.access_token;
            await supabase.from("social_accounts").update({
              access_token_encrypted: encryptSecret(JSON.stringify({accessToken,refreshToken:refreshed.refresh_token ?? secret.refreshToken,expiresAt:refreshed.expires_in ? new Date(Date.now()+refreshed.expires_in*1000).toISOString() : null})),
              refresh_token_encrypted: refreshed.refresh_token ? encryptSecret(refreshed.refresh_token) : undefined,
              token_expires_at: refreshed.expires_in ? new Date(Date.now()+refreshed.expires_in*1000).toISOString() : null
            }).eq("id",account.id).eq("workspace_id",post.workspace_id);
          } else {
            throw new Error("X connection expired.");
          }
        }
        let resolvedImageUrl = post.image_url as string | null;
        const mediaMatch = resolvedImageUrl?.match(/\/api\/media\/([0-9a-f-]{36})/i);
        if (mediaMatch) {
          const { data: media } = await supabase.from("media").select("storage_path").eq("id", mediaMatch[1]).eq("workspace_id", post.workspace_id).maybeSingle();
          if (media?.storage_path) {
            const { data: signed } = await supabase.storage.from("media").createSignedUrl(media.storage_path, 300);
            resolvedImageUrl = signed?.signedUrl ?? null;
          }
        }
        const input = {postId:post.id,title:post.title,caption:post.caption,imageUrl:resolvedImageUrl};
        let result;
        switch (account.platform as Platform) {
          case "LINKEDIN": result = await new LinkedInPublisher().publish(input,accessToken); break;
          case "X": result = await new XPublisher().publish(input,accessToken); break;
          case "FACEBOOK": result = await new MetaSocialPublisher().publishFacebook(input,{id:account.account_id,access_token:accessToken}); break;
          case "INSTAGRAM": {
            const pageId = String((account.metadata as Record<string,unknown>)?.page_id || "");
            result = pageId ? await new MetaSocialPublisher().publishInstagram(input,{id:pageId,access_token:accessToken},account.account_id) : {success:false,externalPostId:null,message:"Instagram Page association is missing.",errorCode:"INSTAGRAM_PAGE_MISSING"};
            break;
          }
        }
        const publishedAt = new Date().toISOString();
        if (result.success) {
          succeeded++;
          await supabase.from("post_publications").update({status:"PUBLISHED",external_post_id:result.externalPostId,published_at:publishedAt,error_message:null}).eq("id",publicationId);
          await supabase.from("posts").update({status:"PUBLISHED",published_at:publishedAt}).eq("id",post.id).eq("workspace_id",post.workspace_id);
        } else {
          failed++;
          await supabase.from("post_publications").update({status:"FAILED",external_post_id:result.externalPostId,error_message:result.message}).eq("id",publicationId);
          await supabase.from("publishing_events").insert({workspace_id:post.workspace_id,post_id:post.id,user_id:post.created_by,platform:post.platform,action:"PUBLISH",status:"FAILED",external_post_id:result.externalPostId,message:result.message,error_code:result.errorCode});
        }
      } catch (err) {
        failed++;
        await supabase.from("post_publications").update({status:"FAILED",error_message:"Publishing job failed."}).eq("id",publicationId);
      }
    }
  }
  return NextResponse.json({ok:true,processed,succeeded,failed});
}
