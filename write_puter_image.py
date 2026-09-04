page = '''"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ImageIcon, Loader2, RefreshCw, Sparkles, Download } from "lucide-react";

export default function ImageStudioPage() {
  const searchParams = useSearchParams();
  const urlPrompt = searchParams.get("prompt") ?? "";

  const [prompt, setPrompt] = useState(urlPrompt);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");

  // Auto-generate image when prompt comes from AI Studio
  useEffect(() => {
    if (urlPrompt) {
      generateImageWithPrompt(urlPrompt);
    }
  }, [urlPrompt]);

  async function generateImageWithPrompt(p: string) {
    if (!p.trim()) return;
    setLoading(true); setError(""); setImageUrl(""); setVideoUrl("");
    try {
      const seed = Math.floor(Math.random() * 999999);
      const url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(p) + "?seed=" + seed + "&width=1024&height=1024&nologo=true&enhance=true";
      // Pre-load image to check it works
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      setImageUrl(url);
    } catch {
      setError("Image generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function generateImage() {
    generateImageWithPrompt(prompt);
  }

  async function generateVideo() {
    if (!prompt.trim()) return;
    setVideoLoading(true); setVideoError(""); setVideoUrl("");
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.video) setVideoUrl(data.video);
      else setVideoError(data.message || "Add HUGGINGFACE_API_TOKEN to .env.local for free video generation.");
    } catch {
      setVideoError("Video generation failed.");
    } finally {
      setVideoLoading(false);
    }
  }

  function download() {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "contentai-image-" + Date.now() + ".png";
    a.target = "_blank";
    a.click();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Image & Video Studio</h1>
        <p className="text-slate-500 mt-1">Generate images and videos for your social media content — free.</p>
        {urlPrompt && (
          <div className="mt-2 rounded-lg bg-violet-50 border border-violet-200 px-4 py-2 text-sm text-violet-700 font-medium">
            Prompt loaded from AI Studio automatically!
          </div>
        )}
      </div>

      {/* Prompt */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Image / Video prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="A steaming cup of coffee on a wooden table with warm morning sunlight..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
        />
        <button onClick={generateImage} disabled={loading || !prompt.trim()}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating image...</> : <><Sparkles size={16} /> Generate Image</>}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 size={36} className="animate-spin text-violet-500 mx-auto" />
            <p className="mt-3 text-sm font-medium text-slate-600">Generating your image...</p>
            <p className="text-xs text-slate-400 mt-1">This takes about 10-15 seconds</p>
          </div>
        </div>
      )}

      {/* Image Result */}
      {imageUrl && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="text-violet-600" />
              <h2 className="font-semibold text-slate-900">Generated Image</h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Free</span>
            </div>
            <button onClick={download} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
              <Download size={13} /> Download
            </button>
          </div>
          <img src={imageUrl} alt="Generated" className="w-full rounded-xl border border-slate-200 object-contain max-h-[600px]" />
          <div className="mt-3 flex gap-2">
            <button onClick={generateImage} disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <RefreshCw size={15} /> Regenerate
            </button>
            <button onClick={download}
              className="flex items-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              <Download size={15} /> Download
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Video Studio */}
      {imageUrl && !loading && (
        <div className="rounded-2xl border-2 border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-purple-600">New Feature</p>
              <h2 className="font-semibold text-slate-950">AI Video Studio</h2>
              <p className="text-xs text-slate-500">Turn your prompt into a short video</p>
            </div>
          </div>

          {videoError && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-semibold text-amber-800 mb-2">Enable free video generation:</p>
              <ol className="list-decimal list-inside space-y-1 text-amber-700 text-xs">
                <li>Go to <strong>huggingface.co</strong> — sign up free</li>
                <li>Settings → Access Tokens → New Token (Read)</li>
                <li>Add to <strong>.env.local</strong>: <code className="bg-amber-100 px-1 rounded">HUGGINGFACE_API_TOKEN=hf_xxx</code></li>
                <li>Restart server: <code className="bg-amber-100 px-1 rounded">npm run dev</code></li>
              </ol>
            </div>
          )}

          {videoUrl ? (
            <div className="space-y-3">
              <video src={videoUrl} controls autoPlay loop muted className="w-full rounded-xl border border-slate-200" />
              <button onClick={() => { setVideoUrl(""); setVideoError(""); }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <RefreshCw size={15} /> Generate Again
              </button>
            </div>
          ) : (
            <button onClick={generateVideo} disabled={videoLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              {videoLoading
                ? <><Loader2 size={16} className="animate-spin" /> Generating video — 30-60 seconds...</>
                : "Generate Video from this prompt"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
'''

import os
os.makedirs("app/(dashboard)/image-studio", exist_ok=True)
with open("app/(dashboard)/image-studio/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
print("SUCCESS!")