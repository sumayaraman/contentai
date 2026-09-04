import type { GeneratedCampaign, CampaignDay } from "./types";

const platforms = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"] as const;
const tones = ["PROFESSIONAL", "FRIENDLY", "FUNNY", "INSPIRATIONAL", "EDUCATIONAL", "LUXURY", "CASUAL"] as const;
const goals = ["ENGAGEMENT", "SALES", "AWARENESS", "TRAFFIC", "LEADS", "BRAND_BUILDING"] as const;

function str(value: unknown, field: string, max: number) {
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  const v = value.trim();
  if (!v) throw new Error(`${field} cannot be empty.`);
  if (v.length > max) throw new Error(`${field} is too long.`);
  return v;
}

export function validateCampaignInput(raw: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  const topic = typeof raw.topic === "string" ? raw.topic.trim() : "";
  const audience = typeof raw.targetAudience === "string" ? raw.targetAudience.trim() : "";
  const platform = typeof raw.platform === "string" ? raw.platform : "";
  const tone = typeof raw.tone === "string" ? raw.tone : "";
  const goal = typeof raw.goal === "string" ? raw.goal : "";
  const duration = Number(raw.duration);
  if (!topic) errors.topic = "Enter a campaign topic."; else if (topic.length > 300) errors.topic = "Topic must be 300 characters or fewer.";
  if (!audience) errors.targetAudience = "Enter a target audience."; else if (audience.length > 300) errors.targetAudience = "Target audience must be 300 characters or fewer.";
  if (!(platforms as readonly string[]).includes(platform)) errors.platform = "Choose a supported platform.";
  if (!(tones as readonly string[]).includes(tone)) errors.tone = "Choose a supported tone.";
  if (!(goals as readonly string[]).includes(goal)) errors.goal = "Choose a campaign goal.";
  if (!Number.isInteger(duration) || duration < 1 || duration > 30) errors.duration = "Duration must be between 1 and 30 days.";
  return { errors, values: { topic, targetAudience: audience, platform, tone, goal, duration } };
}

export function validateGeneratedCampaign(value: unknown, expectedDuration: number): GeneratedCampaign {
  if (!value || typeof value !== "object") throw new Error("AI returned an invalid campaign object.");
  const candidate = value as Record<string, unknown>;
  const title = str(candidate.title, "Campaign title", 200);
  if (!Array.isArray(candidate.days)) throw new Error("AI returned invalid campaign days.");
  if (candidate.days.length !== expectedDuration) throw new Error(`AI returned ${candidate.days.length} days instead of ${expectedDuration}.`);
  const days: CampaignDay[] = candidate.days.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Campaign day ${index + 1} is invalid.`);
    const d = item as Record<string, unknown>;
    const suggestedDate = str(d.suggestedDate, `Day ${index + 1} suggested date`, 40);
    if (Number.isNaN(new Date(suggestedDate).getTime())) throw new Error(`Day ${index + 1} has an invalid date.`);
    return {
      day: index + 1,
      contentIdea: str(d.contentIdea, `Day ${index + 1} content idea`, 500),
      hook: str(d.hook, `Day ${index + 1} hook`, 500),
      caption: str(d.caption, `Day ${index + 1} caption`, 10000),
      cta: str(d.cta, `Day ${index + 1} CTA`, 500),
      hashtags: Array.isArray(d.hashtags) ? d.hashtags.map((h) => str(h, `Day ${index + 1} hashtag`, 80)).slice(0, 15) : [],
      imagePrompt: str(d.imagePrompt, `Day ${index + 1} image prompt`, 2000),
      suggestedDate,
    };
  });
  if (days.some((d) => d.hashtags.length === 0)) throw new Error("Every campaign day needs hashtags.");
  return { title, days };
}
