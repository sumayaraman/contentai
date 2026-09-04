import type { SocialPublishInput, SocialPublishResult } from "@/lib/social/types";
import { socialFetch } from "@/lib/social/http";

const API_VERSION = process.env.LINKEDIN_VERSION || "202604";

export class LinkedInPublisher {
  async getMember(accessToken: string) {
    return socialFetch<{ sub: string; name?: string; email?: string }>("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async publish(input: SocialPublishInput, accessToken: string): Promise<SocialPublishResult> {
    try {
      const member = await this.getMember(accessToken);
      const body = {
        author: `urn:li:person:${member.sub}`,
        commentary: [input.caption, input.title].filter(Boolean).join("\n\n"),
        visibility: "PUBLIC",
        distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      };
      const response = await fetch("https://api.linkedin.com/rest/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
          "Linkedin-Version": API_VERSION,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const externalPostId = response.headers.get("x-restli-id");
      if (!response.ok) throw new Error(`LinkedIn rejected the post (${response.status}).`);
      return { success: true, externalPostId, message: "Published to LinkedIn." };
    } catch (error) {
      return { success: false, externalPostId: null, message: error instanceof Error ? error.message : "LinkedIn publishing failed.", errorCode: "LINKEDIN_PUBLISH_FAILED", requiresReauth: error instanceof Error && /401|unauthorized|token/i.test(error.message) };
    }
  }
}
