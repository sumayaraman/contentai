import { MockSocialPublisher } from "@/lib/publishing/mock-social-publisher";
import type { SocialPublisher } from "@/lib/publishing/types";

export function getSocialPublisher(): SocialPublisher {
  return new MockSocialPublisher();
}
