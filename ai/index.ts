import { AnthropicProvider } from "./providers/anthropic";
import { GroqProvider } from "./providers/groq";
import { MockAIProvider } from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import type { AIProvider } from "./types";

export function getAIProvider(): AIProvider {
  const configured = (process.env.AI_PROVIDER || "auto").toLowerCase();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (configured === "openai" && openaiKey) return new OpenAIProvider(openaiKey);
  if (configured === "anthropic" && anthropicKey) return new AnthropicProvider(anthropicKey);
  if (configured === "groq" && groqKey) return new GroqProvider(groqKey);
  if (configured === "mock") return new MockAIProvider();
  if (configured === "openai" || configured === "anthropic" || configured === "groq") throw new Error(`AI provider '${configured}' is configured but its API key is missing.`);
  if (openaiKey) return new OpenAIProvider(openaiKey);
  if (anthropicKey) return new AnthropicProvider(anthropicKey);
  if (groqKey) return new GroqProvider(groqKey);
  return new MockAIProvider();
}
