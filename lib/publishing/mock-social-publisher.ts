import type { PublishPostInput, PublishResult, SocialPublisher } from "@/lib/publishing/types";

function mockExternalId(postId: string, platform: string) {
  return `mock_${platform.toLowerCase()}_${postId.slice(0, 12)}`;
}

export class MockSocialPublisher implements SocialPublisher {
  async publishPost(input: PublishPostInput): Promise<PublishResult> {
    if (input.simulationMode === "FAILURE") {
      return { success: false, externalPostId: null, errorCode: "MOCK_PUBLISH_FAILURE", message: `Demo publishing failed for ${input.platform}. Retry with Success mode to simulate recovery.` };
    }
    return { success: true, externalPostId: mockExternalId(input.postId, input.platform), message: "Post published successfully in demo mode." };
  }

  async schedulePost(input: PublishPostInput & { scheduledAt: string }): Promise<PublishResult> {
    return { success: true, externalPostId: mockExternalId(input.postId, input.platform), message: `Post scheduled in demo mode for ${input.scheduledAt}.` };
  }

  async deletePost(input: { postId: string; platform: PublishPostInput["platform"]; externalPostId?: string | null }): Promise<PublishResult> {
    return { success: true, externalPostId: input.externalPostId ?? mockExternalId(input.postId, input.platform), message: "Post deleted in demo mode." };
  }
}
