export interface ContentScore {
  score: number;
  breakdown: {
    hookStrength: number;
    readability: number;
    ctaStrength: number;
    platformSuitability: number;
    audienceRelevance: number;
    hashtagQuality: number;
  };
  recommendations: string[];
}

function scoreValue(value: unknown, field: string) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0 || numberValue > 100) throw new Error(`${field} must be between 0 and 100.`);
  return Math.round(numberValue);
}

export function validateContentScore(value: unknown): ContentScore {
  if (!value || typeof value !== "object") throw new Error("AI returned an invalid content score.");
  const candidate = value as Record<string, unknown>;
  if (!candidate.breakdown || typeof candidate.breakdown !== "object") throw new Error("AI returned an invalid score breakdown.");
  const breakdown = candidate.breakdown as Record<string, unknown>;
  if (!Array.isArray(candidate.recommendations)) throw new Error("AI returned invalid recommendations.");
  const recommendations = candidate.recommendations.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 6);
  const values = {
    hookStrength: scoreValue(breakdown.hookStrength, "Hook strength"),
    readability: scoreValue(breakdown.readability, "Readability"),
    ctaStrength: scoreValue(breakdown.ctaStrength, "CTA strength"),
    platformSuitability: scoreValue(breakdown.platformSuitability, "Platform suitability"),
    audienceRelevance: scoreValue(breakdown.audienceRelevance, "Audience relevance"),
    hashtagQuality: scoreValue(breakdown.hashtagQuality, "Hashtag quality"),
  };
  const score = scoreValue(candidate.score, "Score");
  if (!recommendations.length) throw new Error("AI returned no recommendations.");
  return { score, breakdown: values, recommendations };
}
