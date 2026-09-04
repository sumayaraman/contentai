import os
os.makedirs("app/(dashboard)/image-studio", exist_ok=True)

page = '''"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageGenerator } from "@/components/image/image-generator";

export default function ImageStudioPage() {
  const searchParams = useSearchParams();
  const promptFromUrl = searchParams.get("prompt") ?? "";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Image & Video Studio</h1>
        <p className="text-slate-500 mt-1">Generate images and videos for your social media content.</p>
        {promptFromUrl && (
          <div className="mt-3 rounded-lg bg-violet-50 border border-violet-200 px-4 py-2 text-sm text-violet-700">
            Image prompt loaded from AI Studio automatically!
          </div>
        )}
      </div>
      <ImageGeneratorWrapper initialPrompt={promptFromUrl} />
    </div>
  );
}

function ImageGeneratorWrapper({ initialPrompt }: { initialPrompt: string }) {
  return <ImageGenerator posts={[]} initialPrompt={initialPrompt} />;
}
'''

with open("app/(dashboard)/image-studio/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
print("Page updated!")