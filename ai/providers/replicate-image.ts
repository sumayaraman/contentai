import type { GenerateImageInput, GeneratedImage, ImageProvider } from "../image-types";

export class ReplicateImageProvider implements ImageProvider {
  readonly name = "replicate";
  constructor(private readonly apiToken: string) {}

  async generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
    const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt: input.prompt,
          num_outputs: 1,
          num_inference_steps: 4,
        }
      })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => response.statusText);
      throw new Error(`Replicate error: ${detail}`);
    }
    const prediction = await response.json();
    
    // Poll for result
    let result = prediction;
    for (let i = 0; i < 30; i++) {
      if (result.status === "succeeded") break;
      if (result.status === "failed") throw new Error(`Replicate failed: ${result.error}`);
      await new Promise(r => setTimeout(r, 2000));
      const poll = await fetch(result.urls.get, {
        headers: { "Authorization": `Bearer ${this.apiToken}` }
      });
      result = await poll.json();
    }
    
    const url = result.output?.[0];
    if (!url) throw new Error("Replicate returned no image.");
    return { url, provider: "replicate", model: "flux-schnell" };
  }
}