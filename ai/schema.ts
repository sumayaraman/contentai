import type { GeneratedContent } from "./types";

function stringValue(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} cannot be empty.`);
  if (normalized.length > maxLength) throw new Error(`${field} is too long.`);
  return normalized;
}

export function validateGeneratedContent(value: unknown): GeneratedContent {
  if (!value || typeof value !== "object") throw new Error("AI returned an invalid content object.");
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.hashtags)) throw new Error("AI returned invalid hashtags.");
  const hashtags = candidate.hashtags.map((item) => stringValue(item, "Hashtag", 80)).slice(0, 15);
  if (!hashtags.length) throw new Error("AI returned no hashtags.");

  return {
    hook: stringValue(candidate.hook, "Hook", 500),
    caption: stringValue(candidate.caption, "Caption", 10000),
    cta: stringValue(candidate.cta, "CTA", 500),
    hashtags,
    imagePrompt: stringValue(candidate.imagePrompt, "Image prompt", 2000),
  };
}

export function validateGenerationInput(input: Record<string, unknown>) {
  const topic = typeof input.topic === "string" ? input.topic.trim() : "";
  const targetAudience = typeof input.targetAudience === "string" ? input.targetAudience.trim() : "";
  const platform = typeof input.platform === "string" ? input.platform : "";
  const tone = typeof input.tone === "string" ? input.tone : "";
  const objective = typeof input.objective === "string" ? input.objective : "";
  const platforms = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"];
  const tones = ["PROFESSIONAL", "FRIENDLY", "FUNNY", "INSPIRATIONAL", "EDUCATIONAL", "LUXURY", "CASUAL"];
  const objectives = ["ENGAGEMENT", "SALES", "AWARENESS", "TRAFFIC", "LEADS", "BRAND_BUILDING"];
  const errors: Record<string, string> = {};
  if (!topic) errors.topic = "Enter a topic or product.";
  else if (topic.length > 300) errors.topic = "Topic must be 300 characters or fewer.";
  if (!targetAudience) errors.targetAudience = "Enter a target audience.";
  else if (targetAudience.length > 300) errors.targetAudience = "Target audience must be 300 characters or fewer.";
  if (!platforms.includes(platform)) errors.platform = "Choose a supported platform.";
  if (!tones.includes(tone)) errors.tone = "Choose a supported tone.";
  if (!objectives.includes(objective)) errors.objective = "Choose a supported objective.";
  return { errors, values: { topic, targetAudience, platform, tone, objective } };
}
