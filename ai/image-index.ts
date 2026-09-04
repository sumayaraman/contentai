import { MockImageProvider } from "./providers/mock-image";
import { OpenAIImageProvider } from "./providers/openai-image";
import { ReplicateImageProvider } from "./providers/replicate-image";
import { PollinationsImageProvider, GeminiImageProvider } from "./providers/huggingface-image";
import { ImageProvider } from "./image-types";

export function getImageProvider(): ImageProvider {
  const configured = (process.env.IMAGE_PROVIDER ?? "auto").toLowerCase();
  const key = process.env.OPENAI_API_KEY;

  if (configured === "mock") return new MockImageProvider();
  if (configured === "pollinations") return new PollinationsImageProvider();
  if (configured === "replicate" && process.env.REPLICATE_API_TOKEN) return new ReplicateImageProvider(process.env.REPLICATE_API_TOKEN);
  if (configured === "gemini") return new GeminiImageProvider();
  if ((configured === "openai" || configured === "auto") && key) return new OpenAIImageProvider(key);
  return new MockImageProvider();
}