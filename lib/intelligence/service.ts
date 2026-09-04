import { getAIProvider } from "@/ai";
import { validateContentScore } from "./schema";
import type { ContentScore } from "./schema";
import type { ScoreContentInput as AIScoreContentInput } from "@/ai/types";

export type ScoreContentInput = AIScoreContentInput;

function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

export function deterministicContentScore(input: ScoreContentInput): ContentScore {
  const hookWords = input.hook.trim().split(/\s+/).filter(Boolean).length;
  const sentenceCount = Math.max(1, input.caption.split(/[.!?]+/).filter(Boolean).length);
  const avgSentence = input.caption.trim() ? input.caption.trim().split(/\s+/).length / sentenceCount : 0;
  const hashtags = input.hashtags.split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);
  const hookStrength = clamp(45 + Math.min(35, hookWords * 4) + (/[?!]/.test(input.hook) ? 10 : 0));
  const readability = clamp(96 - Math.max(0, avgSentence - 18) * 3 - (input.caption.length > 1600 ? 12 : 0));
  const ctaStrength = clamp(input.cta.trim().length >= 12 ? (/[!?]/.test(input.cta) ? 92 : 82) : 48);
  const platformSuitability = clamp(68 + ({ INSTAGRAM: 12, FACEBOOK: 8, LINKEDIN: 10, X: 6 }[input.platform]) - (input.caption.length > 280 && input.platform === "X" ? 20 : 0));
  const audienceRelevance = clamp(58 + Math.min(35, input.targetAudience.trim().split(/\s+/).filter(Boolean).length * 8));
  const hashtagQuality = clamp(hashtags.length >= 5 && hashtags.length <= 12 ? 90 : hashtags.length > 0 ? 65 : 25);
  const score = clamp((hookStrength + readability + ctaStrength + platformSuitability + audienceRelevance + hashtagQuality) / 6);
  const recommendations: string[] = [];
  if (hookStrength < 80) recommendations.push("Make the opening hook more specific, surprising, or curiosity-driven.");
  if (ctaStrength < 80) recommendations.push("Strengthen the CTA with a clear action that encourages replies or clicks.");
  if (readability < 80) recommendations.push("Shorten long sentences and add more line breaks for easier scanning.");
  if (hashtagQuality < 80) recommendations.push("Use a tighter mix of relevant, specific hashtags instead of broad tags.");
  if (platformSuitability < 80) recommendations.push(`Adapt the format more closely to ${input.platform === "X" ? "X's concise conversational style" : `${input.platform.toLowerCase()}'s native content format`}.`);
  if (audienceRelevance < 80) recommendations.push("Connect the message to a concrete need or aspiration of the target audience.");
  if (!recommendations.length) recommendations.push("Your content is well balanced. Test different hooks and CTAs to find an even stronger variant.");
  return validateContentScore({ score, breakdown: { hookStrength, readability, ctaStrength, platformSuitability, audienceRelevance, hashtagQuality }, recommendations });
}

export async function scoreContent(input: ScoreContentInput): Promise<{ score: ContentScore; provider: string; model: string }> {
  const provider = getAIProvider();
  try {
    const result = await provider.scoreContent(input);
    return { score: validateContentScore(result.score), provider: result.provider, model: result.model };
  } catch {
    const fallback = deterministicContentScore(input);
    return { score: fallback, provider: "mock-fallback", model: "contentai-score-fallback-v1" };
  }
}
