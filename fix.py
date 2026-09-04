with open("components/image/image-generator.tsx", "w", encoding="utf-8") as f:
    f.write("""\
"use client";

import { useState, useTransition } from "react";
import { Check, Clipboard, ImageIcon, Loader2, RefreshCw, Save, Sparkles, Upload } from "lucide-react";
import { attachGeneratedImageToPost, generateImage, saveGeneratedImage } from "@/lib/image/actions";
import type { Post } from "@/types/database";

export function ImageGenerator({ posts = [] }: { posts?: Pick<Post, "id" | "title" | "platform">[] }) {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<"1024x1024" | "1536x1024" | "1024x1536">("1024x1024");
  const [image, setImage] = useState<{ url: string; provider: string; model: string } | null>(null);
  const [savedMediaId, setSavedMediaId] = useState("");
  const [selectedPost, setSelectedPost] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState("");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  function runGeneration() {
    setError(""); setNotice("");
    const form = new FormData();
    form.set("prompt", prompt);
    form.set("size", size);
    startTransition(async () => {
      const result = await generateImage(form);
      if (!result.ok) { setError(result.error || "Image generation failed."); return; }
      const img = result.image ?? null;
      setImage(img); setSavedMediaId(""); setVideoUrl("");
      setNotice(result.demo ? "Generated in Demo Mode." : \`Generated with \${img?.provider ?? "unknown"}.\`);
    });
  }

  function save() {
    if (!image) return;
    const form = new FormData();
    form.set("image_url", image.url);
    form.set("prompt", prompt);
    form.set("provider", image.provider);
    form.set("model", image.model);
    setError("");
    startTransition(async () => {
      const result = await saveGeneratedImage(form);
      if (!result.ok) setError(result.error || "Could not save image.");
      else { setSavedMediaId(result.media?.id ?? ""); setNotice("Image saved to Media Library."); }
    });
  }

  function attach() {
    if (!savedMediaId || !selectedPost) return;
    const form = new FormData();
    form.set("media_id", savedMediaId);
    form.set("post_id", selectedPost);
    startTransition(async () => {
      const result = await attachGeneratedImageToPost(form);
      if (!result.ok) setError(result.error || "Could not attach image.");
      else setNotice("Image attached to post.");
    });
  }

  async function copyPrompt() {
    try { await navigator.clipboard.writeText(prompt); setNotice("Copied!"); }
    catch { setNotice("Clipboard unavailable."); }
  }

  async function generateVideo() {
    if (!prompt) return;
    setIsGeneratingVideo(true); setVideoError(""); setVideoUrl("");
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.video) setVideoUrl(data.video);
      else setVideoError(data.message || "Demo mode - try again later.");
    } catch {
      setVideoError("Video generation failed.");
    } finally {
      setIsGeneratingVideo(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><ImageIcon size={19} /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Phase 6</p>
              <h2 className="mt-1 font-semibold text-slate-950">AI Image Studio</h2>
              <p className="mt-1 text-xs text-slate-500">Turn a prompt into media you can reuse in posts.</p>
            </div>
          </div>
          {image && (
            <span className={\`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold \${image.provider === "mock" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}\`}>
              {image.provider === "mock" ? "Demo Mode" : \`Real API · \${image.provider}\`}
            </span>
          )}
        </div>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Image prompt</label>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={4000} rows={10}
                placeholder="A bright editorial photo of a coffee collection on a sunny cafe table, premium photography, no text."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
              <div className="mt-2 flex justify-end">
                <button type="button" onClick={copyPrompt} disabled={!prompt} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-40">
                  <Clipboard size={13} /> Copy prompt
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Image size</label>
              <select value={size} onChange={(e) => setSize(e.target.value as typeof size)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400">
                <option value="1024x1024">Square 1024x1024</option>
                <option value="1536x1024">Landscape 1536x1024</option>
                <option value="1024x1536">Portrait 1024x1536</option>
              </select>
            </div>
            <button type="button" onClick={runGeneration} disabled={isPending || !prompt.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {isPending ? <Loader2 size={17} className="animate-spin" /> : image ? <RefreshCw size={17} /> : <Sparkles size={17} />}
              {image ? "Regenerate Image" : "Generate Image"}
            </button>
            {notice && <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><Check size={16} className="mt-0.5 shrink-0" />{notice}</div>}
            {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
          </div>
          <div className="min-w-0">
            {!image ? (
              <div className="flex min-h-[430px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                <ImageIcon size={28} className="text-slate-400" />
                <h3 className="mt-4 text-sm font-semibold text-slate-800">Image preview appears here</h3>
                <p className="mt-2 max-w-sm text-xs text-slate-500">Describe a visual and click Generate.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img src={image.url} alt="Generated" className="max-h-[600px] w-full object-contain" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={save} disabled={isPending || Boolean(savedMediaId)} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                    <Save size={16} />{savedMediaId ? "Saved" : "Save to Media Library"}
                  </button>
                  <button type="button" onClick={runGeneration} disabled={isPending} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    <RefreshCw size={16} /> Regenerate
                  </button>
                </div>
                {savedMediaId && posts.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><Upload size={16} /> Attach to post</div>
                    <div className="flex gap-2">
                      <select value={selectedPost} onChange={(e) => setSelectedPost(e.target.value)} className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm">
                        <option value="">Choose a post</option>
                        {posts.map((p) => <option key={p.id} value={p.id}>{p.title} · {p.platform}</option>)}
                      </select>
                      <button type="button" onClick={attach} disabled={isPending || !selectedPost} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                        <Upload size={15} /> Attach
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {image && (
        <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">New Feature</p>
              <h2 className="mt-1 font-semibold text-slate-950">AI Video Studio</h2>
              <p className="mt-1 text-xs text-slate-500">Turn your prompt into a short video — free, no API key needed.</p>
            </div>
          </div>
          {videoError && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{videoError}</div>}
          {videoUrl ? (
            <div className="space-y-3">
              <video src={videoUrl} controls autoPlay loop muted className="w-full rounded-xl border border-slate-200" />
              <button type="button" onClick={() => { setVideoUrl(""); setVideoError(""); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Generate Again
              </button>
            </div>
          ) : (
            <button type="button" onClick={generateVideo} disabled={isGeneratingVideo} className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              {isGeneratingVideo ? <><Loader2 size={17} className="animate-spin" /> Generating video...</> : "Generate Video from this prompt"}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
""")
print("File written successfully!")
