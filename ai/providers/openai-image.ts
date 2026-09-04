import type { GenerateImageInput, GeneratedImage, ImageProvider } from "../image-types";
export class OpenAIImageProvider implements ImageProvider {
  readonly name = "openai";
  constructor(private readonly apiKey: string, private readonly model = "gpt-image-1") {}
  async generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
    const response = await fetch("https://api.openai.com/v1/images/generations", { method: "POST", headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: this.model, prompt: input.prompt, size: input.size ?? "1024x1024", n: 1 }), cache: "no-store" });
    if (!response.ok) { const detail = await response.text().catch(() => ""); throw new Error(`Image provider request failed (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`); }
    const json = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const item = json.data?.[0];
    if (!item) throw new Error("The image provider returned no image.");
    if (item.b64_json) return { url: `data:image/png;base64,${item.b64_json}`, provider: this.name, model: this.model };
    if (item.url) { const imageResponse = await fetch(item.url, { cache: "no-store" }); if (!imageResponse.ok) throw new Error("The image provider returned an inaccessible image URL."); const mime = imageResponse.headers.get("content-type")?.split(";")[0] || "image/png"; const bytes = Buffer.from(await imageResponse.arrayBuffer()); return { url: `data:${mime};base64,${bytes.toString("base64")}`, provider: this.name, model: this.model }; }
    throw new Error("The image provider returned an unsupported image response.");
  }
}
