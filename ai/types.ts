import type { ContentScore } from "@/lib/intelligence/schema";

export type AIPlatform = "INSTAGRAM" | "FACEBOOK" | "LINKEDIN" | "X";
export type AITone = "PROFESSIONAL" | "FRIENDLY" | "FUNNY" | "INSPIRATIONAL" | "EDUCATIONAL" | "LUXURY" | "CASUAL";
export type AIObjective = "ENGAGEMENT" | "SALES" | "AWARENESS" | "TRAFFIC" | "LEADS" | "BRAND_BUILDING";

export interface GenerateContentInput {
  topic: string;
  targetAudience: string;
  platform: AIPlatform;
  tone: AITone;
  objective: AIObjective;
}

export interface GeneratedContent {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  imagePrompt: string;
}

export interface ScoreContentInput {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  platform: AIPlatform;
  targetAudience: string;
}

export interface ContentScoreResult {
  score: ContentScore;
  provider: string;
  model: string;
}

export interface AIProviderResult {
  content: GeneratedContent;
  provider: string;
  model: string;
}

export interface CampaignGenerationInput {
  topic: string;
  targetAudience: string;
  platform: AIPlatform;
  tone: AITone;
  goal: AIObjective;
  duration: number;
  startDate: string;
}

export interface CampaignDay {
  day: number;
  contentIdea: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  imagePrompt: string;
  suggestedDate: string;
}

export interface GeneratedCampaign {
  title: string;
  days: CampaignDay[];
}

export interface AICampaignProviderResult {
  campaign: GeneratedCampaign;
  provider: string;
  model: string;
}

export interface AIProvider {
  readonly name: string;
  generateContent(input: GenerateContentInput): Promise<AIProviderResult>;
  generateCampaign(input: CampaignGenerationInput): Promise<AICampaignProviderResult>;
  scoreContent(input: ScoreContentInput): Promise<ContentScoreResult>;
}
