import type { Platform } from "@/types/database";

export type PublishSimulationMode = "SUCCESS" | "FAILURE";

export interface PublishPostInput {
  postId: string;
  platform: Platform;
  title: string;
  caption: string | null;
  imageUrl: string | null;
  simulationMode?: PublishSimulationMode;
}

export interface PublishResult {
  success: boolean;
  externalPostId: string | null;
  message?: string;
  errorCode?: string;
}

export interface SocialPublisher {
  publishPost(input: PublishPostInput): Promise<PublishResult>;
  schedulePost(input: PublishPostInput & { scheduledAt: string }): Promise<PublishResult>;
  deletePost(input: { postId: string; platform: Platform; externalPostId?: string | null }): Promise<PublishResult>;
}
