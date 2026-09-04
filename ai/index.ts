import { AnthropicProvider } from "./providers/anthropic";
import { GroqProvider } from "./providers/groq";
import { MockAIProvider } from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import type { AIProvider } from "./types";

export function getAIProvider(): AIProvider {
  const configured = (process.env.AI_PROVIDER || "auto").toLowerCase();
  if (configured === "openai" && process.env.OPENAI_API_KEY) return new OpenAIProvider(process.env.OPENAI_API_KEY);
  if (configured === "anthropic" && process.env.ANTHROPIC_API_KEY) return new AnthropicProvider(process.env.ANTHROPIC_API_KEY);
  if (configured === "groq" && process.env.GROQ_API_KEY) return new GroqProvider(process.env.GROQ_API_KEY);
  if (configured === "mock") return new MockAIProvider();
  if (configured === "openai" || configured === "anthropic" || configured === "groq") throw new Error(`AI provider '${configured}' is configured but its API key is missing.`);
  if (process.env.OPENAI_API_KEY) return new OpenAIProvider(process.env.OPENAI_API_KEY);
  if (process.env.ANTHROPIC_API_KEY) return new AnthropicProvider(process.env.ANTHROPIC_API_KEY);
  if (process.env.GROQ_API_KEY) return new GroqProvider(process.env.GROQ_API_KEY);
  return new MockAIProvider();
}
