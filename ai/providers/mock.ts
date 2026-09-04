import type { AIProvider, AIProviderResult, GenerateContentInput, CampaignGenerationInput, AICampaignProviderResult } from "../types";
const platformLabel: Record<GenerateContentInput["platform"], string> = { INSTAGRAM: "Instagram", FACEBOOK: "Facebook", LINKEDIN: "LinkedIn", X: "X" };
const toneLabel: Record<GenerateContentInput["tone"], string> = { PROFESSIONAL: "professional", FRIENDLY: "friendly", FUNNY: "playful", INSPIRATIONAL: "inspirational", EDUCATIONAL: "educational", LUXURY: "premium", CASUAL: "casual" };
export class MockAIProvider implements AIProvider {
  readonly name = "mock";
  async generateContent(input: GenerateContentInput): Promise<AIProviderResult> {
    const platform = platformLabel[input.platform], tone = toneLabel[input.tone];
    return { provider: this.name, model: "contentai-demo-v1", content: { hook: `${input.topic}: a fresh idea your audience will want to discover.`, caption: `Meet ${input.topic} — created with ${tone} storytelling for ${input.targetAudience}.\n\nOn ${platform}, turn this idea into a useful moment for your audience: share what makes the offer different, show the experience behind it, and give people a simple reason to take the next step.\n\nBuilt around the goal of ${input.objective.toLowerCase().replace("_", " ")}, this post is ready for your brand voice and final edits.`, cta: "Discover the collection and tell us what you think.", hashtags: ["#ContentAI", "#SocialMediaMarketing", "#ContentStrategy", "#BrandStorytelling", "#MarketingTips"], imagePrompt: `A polished ${platform} social media campaign image for ${input.topic}, aimed at ${input.targetAudience}, with a ${tone} visual direction, premium commercial photography, clean composition, natural lighting, no text, no logos.` } };
  }
  async generateCampaign(input: CampaignGenerationInput): Promise<AICampaignProviderResult> {
    const start = new Date(`${input.startDate}T12:00:00`);
    const days = Array.from({ length: input.duration }, (_, i) => {
      const date = new Date(start); date.setDate(start.getDate() + i);
      const dateString = date.toISOString().slice(0, 10);
      const themes = ["introduce the story", "educate the audience", "show the product", "share a customer moment", "answer a common question", "create social proof", "invite action"];
      return { day: i + 1, contentIdea: `${input.topic}: ${themes[i % themes.length]}.`, hook: `${i === 0 ? "Meet" : "Here's why"} ${input.topic} deserves a place in your audience's week.`, caption: `Day ${i + 1}: Bring ${input.topic} to life for ${input.targetAudience}. Share one useful, human detail and connect it to ${input.goal.toLowerCase().replace("_", " ")}. Keep the message ${input.tone.toLowerCase()} and make the next step obvious.`, cta: i % 2 ? "Save this idea and share it with someone who needs it." : "Discover more and take the next step today.", hashtags: ["#ContentAI", "#SocialMedia", "#ContentStrategy", "#Marketing", "#BrandStory"], imagePrompt: `A ${input.platform.toLowerCase()} campaign image for ${input.topic}, ${input.targetAudience}, ${input.tone.toLowerCase()} editorial commercial photography, clean composition, natural light, no text, no logos.`, suggestedDate: dateString };
    });
    return { provider: this.name, model: "contentai-campaign-demo-v1", campaign: { title: `${input.topic} — ${input.duration}-Day Campaign`, days } };
  }
  async scoreContent(input: import("../types").ScoreContentInput): Promise<import("../types").ContentScoreResult> {
    const words = input.caption.trim().split(/\s+/).filter(Boolean).length;
    const hashtags = input.hashtags.split(/[\s,]+/).filter(Boolean).length;
    const hookStrength = Math.min(98, 58 + input.hook.length * 0.25);
    const readability = Math.min(96, 72 + Math.min(24, words / 8));
    const ctaStrength = Math.min(95, input.cta.length >= 12 ? 88 : 55);
    const platformSuitability = input.platform === "X" && words > 45 ? 70 : 90;
    const audienceRelevance = Math.min(96, 65 + input.targetAudience.length * 0.25);
    const hashtagQuality = hashtags >= 5 && hashtags <= 12 ? 92 : 68;
    const score = Math.round((hookStrength + readability + ctaStrength + platformSuitability + audienceRelevance + hashtagQuality) / 6);
    return { provider: this.name, model: "contentai-score-demo-v1", score: { score, breakdown: { hookStrength, readability, ctaStrength, platformSuitability, audienceRelevance, hashtagQuality }, recommendations: [ctaStrength < 80 ? "Strengthen your CTA with a specific action that invites a response." : "Your CTA is clear; test a question-based variant to encourage more comments.", hookStrength < 80 ? "Make the hook more specific or curiosity-driven." : "Your hook has a strong opening; keep testing different angles."] } };
  }
}
