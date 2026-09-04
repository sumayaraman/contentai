import type { SocialPublishInput, SocialPublishResult } from "@/lib/social/types";
import { socialFetch } from "@/lib/social/http";

const graphVersion = process.env.META_GRAPH_VERSION || "v24.0";
const graph = (path: string) => `https://graph.facebook.com/${graphVersion}${path}`;

type MetaPage = { id: string; name: string; access_token: string; instagram_business_account?: { id: string } };

export class MetaSocialPublisher {
  async getPages(accessToken: string) {
    const response = await socialFetch<{ data: MetaPage[] }>(graph(`/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(accessToken)}`));
    return response.data || [];
  }

  async publishFacebook(input: SocialPublishInput, page: { id: string; access_token: string }): Promise<SocialPublishResult> {
    try {
      const params = new URLSearchParams({ message: [input.title, input.caption].filter(Boolean).join("\n\n"), access_token: page.access_token });
      if (input.imageUrl) params.set("link", input.imageUrl);
      const result = await socialFetch<{ id?: string }>(graph(`/${page.id}/feed`), { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params });
      return { success: true, externalPostId: result.id ?? null, message: "Published to Facebook." };
    } catch (error) {
      return { success: false, externalPostId: null, message: error instanceof Error ? error.message : "Facebook publishing failed.", errorCode: "FACEBOOK_PUBLISH_FAILED", requiresReauth: error instanceof Error && /401|oauth|token/i.test(error.message) };
    }
  }

  async publishInstagram(input: SocialPublishInput, page: { id: string; access_token: string }, instagramId: string): Promise<SocialPublishResult> {
    if (!input.imageUrl) return { success: false, externalPostId: null, message: "Instagram publishing requires an image.", errorCode: "INSTAGRAM_IMAGE_REQUIRED" };
    try {
      const createParams = new URLSearchParams({ image_url: input.imageUrl, caption: [input.title, input.caption].filter(Boolean).join("\n\n"), access_token: page.access_token });
      const container = await socialFetch<{ id: string }>(graph(`/${instagramId}/media`), { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: createParams });
      const publishParams = new URLSearchParams({ creation_id: container.id, access_token: page.access_token });
      const published = await socialFetch<{ id?: string }>(graph(`/${instagramId}/media_publish`), { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: publishParams });
      return { success: true, externalPostId: published.id ?? null, message: "Published to Instagram." };
    } catch (error) {
      return { success: false, externalPostId: null, message: error instanceof Error ? error.message : "Instagram publishing failed.", errorCode: "INSTAGRAM_PUBLISH_FAILED", requiresReauth: error instanceof Error && /401|oauth|token/i.test(error.message) };
    }
  }
}
