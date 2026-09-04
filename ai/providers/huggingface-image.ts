import { ImageProvider, GenerateImageInput, GeneratedImage } from "../image-types";

export class PollinationsImageProvider implements ImageProvider {
  readonly name = "pollinations";

  async generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
    const { prompt } = input;
    const width = 1024;
    const height = 1024;
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Pollinations fetch failed");

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = blob.type || "image/jpeg";

    return {
      url: `data:${mimeType};base64,${base64}`,
      provider: "pollinations",
      model: "flux",
    };
  }
}

export class GeminiImageProvider implements ImageProvider {
  readonly name = "gemini";

  async generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
    const { prompt } = input;
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini image generation failed");
    }

    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    );

    if (!imagePart) throw new Error("No image returned from Gemini");

    return {
      url: `data:image/png;base64,${imagePart.inlineData.data}`,
      provider: "gemini",
      model: "gemini-2.0-flash",
    };
  }
}