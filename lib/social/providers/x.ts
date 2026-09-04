import type { SocialPublishInput, SocialPublishResult } from "@/lib/social/types";
import { socialFetch } from "@/lib/social/http";

export class XPublisher {
  async getUser(accessToken: string) {
    return socialFetch<{ data: { id: string; name: string; username: string } }>("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async publish(input: SocialPublishInput, accessToken: string): Promise<SocialPublishResult> {
    try {
      const text = [input.caption, input.title].filter(Boolean).join("\n\n").slice(0, 280);
      const response = await socialFetch<{ data?: { id: string } }>("https://api.x.com/2/tweets", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      return { success: true, externalPostId: response.data?.id ?? null, message: "Published to X." };
    } catch (error) {
      return { success: false, externalPostId: null, message: error instanceof Error ? error.message : "X publishing failed.", errorCode: "X_PUBLISH_FAILED", requiresReauth: error instanceof Error && /401|unauthorized|token/i.test(error.message) };
    }
  }
}
