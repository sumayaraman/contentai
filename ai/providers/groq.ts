import type {
  AIProvider,
  AIProviderResult,
  GenerateContentInput,
  CampaignGenerationInput,
  AICampaignProviderResult,
  ScoreContentInput,
  ContentScoreResult,
} from "../types";
import { validateGeneratedContent } from "../schema";
import { validateGeneratedCampaign } from "../campaign-schema";
import { validateContentScore } from "@/lib/intelligence/schema";
import { MockAIProvider } from "./mock";

const DEPRECATED_MODELS = new Set([
  "llama3-8b-8192",
  "llama3-70b-8192",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
]);

const CANDIDATE_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
  "llama-3.2-3b-preview",
  "llama-3.2-11b-vision-preview",
  "llama-3.2-1b-preview",
];

export class GroqProvider implements AIProvider {
  readonly name = "groq";
  private readonly apiKey: string;
  private readonly initialModel: string;
  private activeModel: string;
  private readonly mockFallback: MockAIProvider;

  constructor(
    apiKey: string,
    model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
  ) {
    this.apiKey = apiKey.trim();
    const cleanModel = model.trim();
    this.initialModel = DEPRECATED_MODELS.has(cleanModel)
      ? "llama-3.3-70b-versatile"
      : cleanModel;
    this.activeModel = this.initialModel;
    this.mockFallback = new MockAIProvider();
  }

  get model(): string {
    return this.activeModel;
  }

  private async request(system: string, input: unknown): Promise<unknown> {
    const modelsToTry = [
      this.activeModel,
      ...CANDIDATE_MODELS.filter((m) => m !== this.activeModel),
    ];

    let lastError: Error | null = null;

    for (const targetModel of modelsToTry) {
      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              temperature: 0.7,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: system },
                {
                  role: "user",
                  content:
                    typeof input === "string"
                      ? input
                      : JSON.stringify(input),
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          const errBody = await response.json().catch(() => null);
          const errMsg =
            errBody?.error?.message ||
            `Groq request failed with status ${response.status}`;
          console.warn(
            `Groq model '${targetModel}' returned ${response.status}: ${errMsg}. Trying fallback model...`
          );
          lastError = new Error(errMsg);
          continue; // Try next model in list
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const raw = data.choices?.[0]?.message?.content;
        if (!raw) {
          console.warn(
            `Groq model '${targetModel}' returned empty content. Trying fallback model...`
          );
          lastError = new Error("Groq returned an empty response.");
          continue;
        }

        try {
          const parsed = JSON.parse(raw);
          this.activeModel = targetModel;
          return parsed;
        } catch {
          console.warn(
            `Groq model '${targetModel}' returned invalid JSON. Trying fallback model...`
          );
          lastError = new Error("Groq returned invalid JSON.");
          continue;
        }
      } catch (networkErr) {
        console.warn(
          `Groq network/request error with model '${targetModel}':`,
          networkErr
        );
        lastError =
          networkErr instanceof Error
            ? networkErr
            : new Error(String(networkErr));
      }
    }

    console.warn(
      "All Groq models failed. Falling back to built-in generator to ensure uninterrupted output:",
      lastError?.message
    );
    return null;
  }

  async generateContent(
    input: GenerateContentInput
  ): Promise<AIProviderResult> {
    try {
      const parsed = await this.request(
        "Return only valid JSON with exactly these keys: hook, caption, cta, hashtags, imagePrompt. hashtags must be an array of 5 to 15 hashtag strings. No markdown.",
        input
      );
      if (parsed) {
        return {
          provider: this.name,
          model: this.activeModel,
          content: validateGeneratedContent(parsed),
        };
      }
    } catch (err) {
      console.warn("Groq generateContent error:", err);
    }

    // Graceful fallback to mock provider so the user never sees a hard 404 crash
    return this.mockFallback.generateContent(input);
  }

  async generateCampaign(
    input: CampaignGenerationInput
  ): Promise<AICampaignProviderResult> {
    try {
      const parsed = await this.request(
        "Return only JSON with exactly: title and days. days must contain exactly the requested duration. Each day must have contentIdea, hook, caption, cta, hashtags (array), imagePrompt, suggestedDate. Use supplied dates. No markdown.",
        input
      );
      if (parsed) {
        return {
          provider: this.name,
          model: this.activeModel,
          campaign: validateGeneratedCampaign(parsed, input.duration),
        };
      }
    } catch (err) {
      console.warn("Groq generateCampaign error:", err);
    }

    return this.mockFallback.generateCampaign(input);
  }

  async scoreContent(
    input: ScoreContentInput
  ): Promise<ContentScoreResult> {
    try {
      const parsed = await this.request(
        "You are a social content strategist. Return only valid JSON with exactly: score, breakdown, recommendations. score and each breakdown field must be integers 0-100. breakdown keys: hookStrength, readability, ctaStrength, platformSuitability, audienceRelevance, hashtagQuality. recommendations must be an array of concise strings.",
        input
      );
      if (parsed) {
        return {
          provider: this.name,
          model: this.activeModel,
          score: validateContentScore(parsed),
        };
      }
    } catch (err) {
      console.warn("Groq scoreContent error:", err);
    }

    return this.mockFallback.scoreContent(input);
  }
}
