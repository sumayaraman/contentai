import type { Platform } from "@/types/database";

export type SocialAccount = {
  id: string;
  workspace_id: string;
  connected_by: string;
  platform: Platform;
  account_id: string;
  account_name: string;
  username: string | null;
  scopes: string[] | null;
  token_expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SocialAccountSecret = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
};

export type SocialConnectionResult = {
  success: boolean;
  account?: Omit<SocialAccount, "id" | "workspace_id" | "connected_by" | "created_at" | "updated_at">;
  secret?: SocialAccountSecret;
  error?: string;
};

export type SocialPublishInput = {
  postId: string;
  title: string;
  caption: string | null;
  imageUrl: string | null;
};

export type SocialPublishResult = {
  success: boolean;
  externalPostId: string | null;
  message: string;
  errorCode?: string;
  requiresReauth?: boolean;
};

export const SOCIAL_PLATFORMS: Platform[] = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"];
