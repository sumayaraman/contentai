export interface WatermarkOptions {
  imageBase64: string;
  logoMediaId: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  logoSizePercent?: number;
  padding?: number;
}

export interface WatermarkResult {
  watermarkedBase64: string;
  mimeType: string;
}

export async function applyWatermark(
  opts: WatermarkOptions
): Promise<WatermarkResult> {
  const res = await fetch("/api/images/watermark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64:     opts.imageBase64,
      logoMediaId:     opts.logoMediaId,
      position:        opts.position ?? "bottom-right",
      logoSizePercent: opts.logoSizePercent ?? 18,
      padding:         opts.padding ?? 24,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Watermark API error ${res.status}`);
  }

  return res.json();
}

export function stripDataPrefix(base64: string): string {
  return base64.replace(/^data:[^;]+;base64,/, "");
}

export function toDataUrl(base64: string, mimeType = "image/jpeg"): string {
  if (base64.startsWith("data:")) return base64;
  return `data:${mimeType};base64,${base64}`;
}
