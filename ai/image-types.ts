export interface GenerateImageInput {
  prompt: string;
  size?: "1024x1024" | "1536x1024" | "1024x1536";
}
export interface GeneratedImage { url: string; provider: string; model: string; }
export interface ImageProvider { readonly name: string; generateImage(input: GenerateImageInput): Promise<GeneratedImage>; }
