"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Clipboard,
  Download,
  Film,
  ImageIcon,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { attachGeneratedImageToPost, saveGeneratedImage } from "@/lib/image/actions";
import type { Post } from "@/types/database";

const PROMPT_SUGGESTIONS = [
  "A sleek, glossy black sports car parked on a scenic coastal road at sunset, vibrant warm lighting, cinematic 8k",
  "Specialty espresso pour in a minimalist ceramic cup, golden morning sunlight, rich crema, cafe aesthetic",
  "Organic coffee beans in a handcrafted wooden scoop, rustic cafe table background, shallow depth of field",
  "Modern glass office with plants, warm cozy lighting, professional laptop workstation, minimalist aesthetic",
];

const ASPECT_RATIOS = [
  { id: "1024x1024", label: "1:1 Square", sub: "Instagram, Feed", ratio: "aspect-square" },
  { id: "1536x1024", label: "16:9 Wide", sub: "Twitter, Web banner", ratio: "aspect-[16/9]" },
  { id: "1024x1536", label: "9:16 Tall", sub: "Stories, Reels", ratio: "aspect-[9/16]" },
] as const;

export function ImageGenerator({
  posts = [],
  initialPrompt = "",
}: {
  posts?: Pick<Post, "id" | "title" | "platform">[];
  initialPrompt?: string;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [size, setSize] = useState<"1024x1024" | "1536x1024" | "1024x1536">("1024x1024");
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
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
    if (!prompt.trim()) return;
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        const seed = Math.floor(Math.random() * 999999);
        const [w, h] = size.split("x").map(Number);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=${w}&height=${h}&nologo=true`;

        // Preload image in background
        await new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        setImage({ url, provider: "pollinations", model: "flux" });
        setSavedMediaId("");
        setVideoUrl("");
        setNotice("Image generated successfully!");
      } catch {
        setError("Image generation failed. Please try again.");
      }
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
      if (!result.ok) {
        setError(result.error || "Could not save image.");
      } else {
        setSavedMediaId(result.media?.id ?? "");
        setNotice("Image saved to Media Library.");
      }
    });
  }

  function attach() {
    if (!savedMediaId || !selectedPost) return;
    const form = new FormData();
    form.set("media_id", savedMediaId);
    form.set("post_id", selectedPost);
    startTransition(async () => {
      const result = await attachGeneratedImageToPost(form);
      if (!result.ok) {
        setError(result.error || "Could not attach image.");
      } else {
        setNotice("Image attached to post.");
      }
    });
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setNotice("Prompt copied to clipboard!");
    } catch {
      setNotice("Clipboard unavailable.");
    }
  }

  function downloadImage() {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `contentai-${Date.now()}.jpg`;
    link.target = "_blank";
    link.click();
  }

  async function generateVideo() {
    if (!prompt.trim()) return;
    setIsGeneratingVideo(true);
    setVideoError("");
    setVideoUrl("");
    try {
      const token = process.env.NEXT_PUBLIC_HUGGINGFACE_API_TOKEN;
      if (!token) {
        setVideoError("Video provider requires NEXT_PUBLIC_HUGGINGFACE_API_TOKEN in environment variables.");
        return;
      }
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-wait-for-model": "true",
          },
          body: JSON.stringify({ inputs: prompt, parameters: { num_frames: 14 } }),
        }
      );
      if (!response.ok) {
        const err = await response.text();
        setVideoError(`Video generation failed: ${err.slice(0, 200)}`);
        return;
      }
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      setVideoUrl(`data:video/mp4;base64,${base64}`);
    } catch {
      setVideoError("Video generation failed. Please try again.");
    } finally {
      setIsGeneratingVideo(false);
    }
  }

  return (
    <div className="studio-container">
      <style>{`
        .studio-container {
          max-width: 1360px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .studio-header-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 8px 14px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .studio-tabs {
          display: flex;
          gap: 6px;
        }

        .studio-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--r-md);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .studio-tab-btn.active {
          background: var(--accent-soft);
          color: #b0a0ff;
        }

        .studio-grid {
          display: grid;
          grid-template-columns: 440px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .studio-panel {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }

        .studio-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: 0.03em;
        }

        .studio-textarea {
          width: 100%;
          min-height: 120px;
          border-radius: var(--r-md);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-primary);
          outline: none;
          resize: vertical;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .studio-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(109,92,255,0.18);
        }

        .studio-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .studio-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 99px;
          padding: 4px 10px;
          font-size: 11px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .studio-chip:hover {
          background: var(--accent-soft);
          color: #a89dff;
          border-color: var(--border-accent);
        }

        .studio-ratio-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .studio-ratio-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 8px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--r-md);
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }

        .studio-ratio-card:hover {
          border-color: rgba(109,92,255,0.3);
          background: rgba(109,92,255,0.06);
        }

        .studio-ratio-card.active {
          border-color: var(--accent);
          background: var(--accent-soft);
          color: #b0a0ff;
        }

        .studio-stage {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-height: 520px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }

        .studio-stage-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          border: 1px dashed rgba(255,255,255,0.12);
          border-radius: var(--r-lg);
          padding: 40px;
          text-align: center;
          background: rgba(255,255,255,0.01);
        }

        .studio-stage-preview {
          position: relative;
          width: 100%;
          border-radius: var(--r-lg);
          overflow: hidden;
          background: #000;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .studio-action-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 1024px) {
          .studio-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Top Header Navigation bar */}
      <div className="studio-header-nav">
        <div className="studio-tabs">
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === "image" ? "active" : ""}`}
            onClick={() => setActiveTab("image")}
          >
            <ImageIcon size={16} /> Image Studio
          </button>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === "video" ? "active" : ""}`}
            onClick={() => setActiveTab("video")}
          >
            <Film size={16} /> Video Studio
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="badge badge-ai" style={{ fontSize: 11 }}>
            <span className="ai-dot" style={{ width: 6, height: 6 }} />
            Free · Pollinations Flux
          </span>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: "var(--r-md)",
          color: "#4ade80",
          fontSize: 13,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={16} />
            <span>{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice("")} style={{ background: "transparent", border: "none", color: "#4ade80", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "var(--r-md)",
          color: "#f87171",
          fontSize: 13,
        }}>
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="studio-grid">
        {/* LEFT COLUMN: Controls */}
        <div className="studio-panel">
          {/* Prompt Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="studio-label">
              <span>{activeTab === "image" ? "Image Prompt" : "Video Scene Prompt"}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={copyPrompt}
                  disabled={!prompt.trim()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}
                  title="Copy prompt"
                >
                  <Clipboard size={12} /> Copy
                </button>
                {prompt && (
                  <button
                    type="button"
                    onClick={() => setPrompt("")}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to create in vivid detail (subject, lighting, mood, colors)…"
              className="studio-textarea"
              rows={4}
            />

            {/* Quick Inspiration Chips */}
            <div style={{ marginTop: 2 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Inspiration shortcuts:
              </span>
              <div className="studio-chips">
                {PROMPT_SUGGESTIONS.map((text, i) => (
                  <button
                    key={i}
                    type="button"
                    className="studio-chip"
                    onClick={() => setPrompt(text)}
                  >
                    <Sparkles size={10} style={{ color: "var(--accent)" }} />
                    {i === 0 ? "🏎️ Coastal Car" : i === 1 ? "☕ Ceramic Espresso" : i === 2 ? "🌿 Coffee Beans" : "💼 Workspace"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Format / Aspect Ratio (Image Mode) */}
          {activeTab === "image" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="studio-label">
                <span>Aspect Ratio &amp; Size</span>
              </div>
              <div className="studio-ratio-grid">
                {ASPECT_RATIOS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`studio-ratio-card ${size === item.id ? "active" : ""}`}
                    onClick={() => setSize(item.id as typeof size)}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          {activeTab === "image" ? (
            <button
              type="button"
              onClick={runGeneration}
              disabled={isPending || !prompt.trim()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: "var(--r-md)",
                background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
                padding: "14px 20px",
                fontSize: 14,
                fontWeight: 700,
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(109,92,255,0.35)",
                opacity: isPending || !prompt.trim() ? 0.5 : 1,
              }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating Image…
                </>
              ) : image ? (
                <>
                  <RefreshCw size={16} /> Regenerate Image
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate Free Image
                </>
              )}
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={generateVideo}
                disabled={isGeneratingVideo || !prompt.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: "var(--r-md)",
                  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  padding: "14px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(168,85,247,0.35)",
                  opacity: isGeneratingVideo || !prompt.trim() ? 0.5 : 1,
                }}
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Rendering Video (30-60s)…
                  </>
                ) : (
                  <>
                    <Film size={16} /> Generate Video from Prompt
                  </>
                )}
              </button>
              {videoError && (
                <p style={{ fontSize: 11.5, color: "#f87171", background: "rgba(239,68,68,0.08)", padding: "10px 12px", borderRadius: 8 }}>
                  {videoError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Stage & Output */}
        <div className="studio-stage">
          {activeTab === "image" ? (
            !image ? (
              <div className="studio-stage-empty">
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: "rgba(109,92,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: "#a89dff",
                }}>
                  <WandSparkles size={28} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                  Ready to Create
                </h3>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", maxWidth: 360, marginTop: 6, lineHeight: 1.6 }}>
                  Type a visual description or select an inspiration tag on the left, then click Generate. Your high-resolution image will render here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="studio-stage-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={prompt}
                    style={{ maxHeight: "540px", width: "100%", objectFit: "contain" }}
                  />
                </div>

                {/* Actions Toolbar */}
                <div className="studio-action-row">
                  <button
                    type="button"
                    onClick={save}
                    disabled={isPending || Boolean(savedMediaId)}
                    className="btn btn-primary btn-sm"
                    style={{ gap: 6 }}
                  >
                    <Save size={14} />
                    {savedMediaId ? "Saved to Library" : "Save to Media Library"}
                  </button>

                  <button
                    type="button"
                    onClick={downloadImage}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 6 }}
                  >
                    <Download size={14} /> Download
                  </button>

                  <button
                    type="button"
                    onClick={runGeneration}
                    disabled={isPending}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 6 }}
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("video")}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 6, color: "#c084fc" }}
                  >
                    <Film size={14} /> Turn to Video
                  </button>
                </div>

                {/* Attach to post option */}
                {posts.length > 0 && (
                  <div style={{
                    marginTop: 8,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Upload size={14} style={{ color: "var(--accent)" }} /> Attach this picture to a planned social post
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <select
                        value={selectedPost}
                        onChange={(e) => setSelectedPost(e.target.value)}
                        style={{
                          flex: 1,
                          height: 38,
                          borderRadius: "var(--r-md)",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                          padding: "0 12px",
                          fontSize: 12.5,
                          outline: "none",
                        }}
                      >
                        <option value="">Select a planned post…</option>
                        {posts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.platform})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={attach}
                        disabled={isPending || !selectedPost || !savedMediaId}
                        title={!savedMediaId ? "Save the image to Media Library first" : undefined}
                        className="btn btn-primary btn-sm"
                      >
                        Attach
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            // VIDEO TAB
            <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 16 }}>
              {videoUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="studio-stage-preview">
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      style={{ maxHeight: "540px", width: "100%", borderRadius: "var(--r-lg)" }}
                    />
                  </div>
                  <div className="studio-action-row">
                    <a
                      href={videoUrl}
                      download="contentai-video.mp4"
                      className="btn btn-primary btn-sm"
                      style={{ gap: 6 }}
                    >
                      <Download size={14} /> Download Video
                    </a>
                    <button
                      type="button"
                      onClick={() => { setVideoUrl(""); setVideoError(""); }}
                      className="btn btn-ghost btn-sm"
                    >
                      Generate Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="studio-stage-empty">
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: "rgba(168,85,247,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    color: "#c084fc",
                  }}>
                    <Film size={28} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                    AI Video Studio
                  </h3>
                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)", maxWidth: 380, marginTop: 6, lineHeight: 1.6 }}>
                    Convert your prompt into a dynamic short video using Stable Video Diffusion.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
