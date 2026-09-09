"use client";

import { useState, useCallback } from "react";
import { applyWatermark, stripDataPrefix, toDataUrl } from "@/lib/watermark";

interface GenerateWithLogoOptions {
  logoMediaId: string | null;
  logoPosition?: string;
  generateFn: (prompt: string) => Promise<string>;
}

interface GenerateWithLogoResult {
  generate: (prompt: string) => Promise<string>;
  isGenerating: boolean;
  isWatermarking: boolean;
  error: string | null;
}

export function useGenerateWithLogo({
  logoMediaId,
  logoPosition = "bottom-right",
  generateFn,
}: GenerateWithLogoOptions): GenerateWithLogoResult {
  const [isGenerating, setIsGenerating]     = useState(false);
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  const generate = useCallback(async (prompt: string): Promise<string> => {
    setError(null);

    try {
      setIsGenerating(true);
      const rawResult = await generateFn(prompt);
      setIsGenerating(false);

      if (logoMediaId) {
        setIsWatermarking(true);
        const rawBase64 = stripDataPrefix(rawResult);

        const { watermarkedBase64, mimeType } = await applyWatermark({
          imageBase64: rawBase64,
          logoMediaId,
          position: logoPosition as any,
        });

        setIsWatermarking(false);
        return toDataUrl(watermarkedBase64, mimeType);
      }

      return rawResult;
    } catch (err: any) {
      setIsGenerating(false);
      setIsWatermarking(false);
      setError(err.message ?? "Image generation failed");
      throw err;
    }
  }, [logoMediaId, logoPosition, generateFn]);

  return { generate, isGenerating, isWatermarking, error };
}
