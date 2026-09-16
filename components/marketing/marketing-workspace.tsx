"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  CalendarPlus,
  Check,
  Coffee,
  ImageIcon,
  Loader2,
  Palette,
  RefreshCw,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { generateMarketingImage, generateMarketingPlan, saveMarketingPosts } from "@/lib/marketing/actions";
import { saveGeneratedImage } from "@/lib/image/actions";
import { updateBrandSettings, uploadBrandLogo } from "@/lib/workspace/brand-actions";
import type { AIObjective, AIPlatform, AITone, CampaignDay } from "@/ai/types";

type MarketingItem = CampaignDay & {
  slot: number;
  imageUrl?: string | null;
  status?: "pending" | "generating" | "ready" | "error";
};

type Props = {
  workspace: {
    id: string;
    name: string;
    brand_name?: string | null;
    brand_description?: string | null;
    brand_logo_url?: string | null;
    brand_primary_color?: string | null;
    brand_secondary_color?: string | null;
    brand_voice?: string | null;
  };
  canEdit: boolean;
};

const platforms: Array<[AIPlatform, string]> = [
  ["INSTAGRAM", "Instagram"],
  ["FACEBOOK", "Facebook"],
  ["LINKEDIN", "LinkedIn"],
  ["X", "X"],
];

const tones: Array<[AITone, string]> = [
  ["FRIENDLY", "Friendly"],
  ["PROFESSIONAL", "Professional"],
  ["CASUAL", "Casual"],
  ["FUNNY", "Playful"],
  ["INSPIRATIONAL", "Inspirational"],
  ["EDUCATIONAL", "Educational"],
  ["LUXURY", "Luxury"],
];

const goals: Array<[AIObjective, string]> = [
  ["AWARENESS", "Brand awareness"],
  ["ENGAGEMENT", "Engagement"],
  ["SALES", "Sales"],
  ["TRAFFIC", "Traffic"],
  ["LEADS", "Leads"],
  ["BRAND_BUILDING", "Brand building"],
];

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export function MarketingWorkspace({ workspace, canEdit }: Props) {
  const [activeTab, setActiveTab] = useState<"brand" | "plan">("brand");
  const [brandName, setBrandName] = useState(workspace.brand_name || workspace.name);
  const [description, setDescription] = useState(workspace.brand_description || "");
  const [voice, setVoice] = useState(workspace.brand_voice || "Friendly, warm and professional");
  const [primary, setPrimary] = useState(workspace.brand_primary_color || "#6d5cff");
  const [secondary, setSecondary] = useState(workspace.brand_secondary_color || "#f59e0b");
  const [logoUrl, setLogoUrl] = useState(workspace.brand_logo_url || "");
  const [logoPosition, setLogoPosition] = useState<"bottom-right" | "top-right" | "top-left" | "bottom-left">("bottom-right");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState<AIPlatform>("INSTAGRAM");
  const [tone, setTone] = useState<AITone>("FRIENDLY");
  const [goal, setGoal] = useState<AIObjective>("AWARENESS");
  const [duration, setDuration] = useState(30);
  const [postsPerDay, setPostsPerDay] = useState(1);
  const [startDate, setStartDate] = useState(tomorrow());
  const [imageSize, setImageSize] = useState<"1024x1024" | "1536x1024" | "1024x1536">("1024x1024");
  const [items, setItems] = useState<MarketingItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const total = duration * postsPerDay;
  const ready = items.filter((item) => item.status === "ready").length;

  async function handleLogo(file: File | undefined) {
    if (!file || !canEdit) return;
    setError("");
    setMessage("Uploading logo…");
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setLogoUrl(dataUrl);
      const result = await uploadBrandLogo(workspace.id, dataUrl);
      if (!result.ok) {
        setMessage("Logo loaded for this session.");
      } else {
        setLogoUrl(result.url);
        setMessage("Logo saved and ready. It will be composited onto every generated image.");
      }
    };
    reader.onerror = () => setError("Could not read the logo file.");
    reader.readAsDataURL(file);
  }

  function saveBrand() {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await updateBrandSettings(workspace.id, {
        brandName,
        description,
        primaryColor: primary,
        secondaryColor: secondary,
        voice,
        logoUrl,
      });
      if (!result.ok) setError(result.error);
      else setMessage("Brand workspace and logo saved.");
    });
  }

  function generatePlan() {
    setError("");
    setMessage("");
    setItems([]);
    setProgress(0);
    startTransition(async () => {
      const result = await generateMarketingPlan({
        businessName: brandName,
        description,
        audience,
        platform,
        tone,
        goal,
        startDate,
        duration,
        postsPerDay,
        brandVoice: voice,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const newItems: MarketingItem[] = result.items.map((item) => ({
        ...item,
        status: "pending",
        imageUrl: null,
      }));
      setItems(newItems);
      setMessage(`Plan ready! Generating branded pictures for all ${newItems.length} days with your logo…`);
      void generateImages(newItems);
    });
  }

  async function loadSafeImage(src: string): Promise<HTMLImageElement> {
    if (src.startsWith("data:")) {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image data"));
        img.src = src;
      });
      return img;
    }

    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to decode image blob"));
        };
        img.src = objectUrl;
      });
      return img;
    } catch {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = src;
      });
      return img;
    }
  }

  async function composeLogo(imageUrl: string): Promise<string> {
    if (!logoUrl) return imageUrl;
    try {
      const [image, logo] = await Promise.all([
        loadSafeImage(imageUrl),
        loadSafeImage(logoUrl),
      ]);

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || 1024;
      canvas.height = image.naturalHeight || 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return imageUrl;

      // 1. Draw base marketing image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // 2. Compute proportional logo dimensions
      const targetWidth = Math.round(canvas.width * 0.18);
      const naturalW = logo.naturalWidth || 1;
      const naturalH = logo.naturalHeight || 1;
      const ratio = naturalH / naturalW;

      let w = targetWidth;
      let h = Math.round(w * ratio);
      const maxHeight = Math.round(canvas.height * 0.16);
      if (h > maxHeight) {
        h = maxHeight;
        w = Math.round(h / ratio);
      }

      // 3. Compute position
      const pad = Math.max(24, Math.round(canvas.width * 0.035));
      let x = pad;
      let y = pad;

      if (logoPosition === "top-right") {
        x = canvas.width - w - pad;
        y = pad;
      } else if (logoPosition === "bottom-right") {
        x = canvas.width - w - pad;
        y = canvas.height - h - pad;
      } else if (logoPosition === "bottom-left") {
        x = pad;
        y = canvas.height - h - pad;
      }

      // 4. Draw frosted rounded glass badge behind logo for optimal contrast
      const badgePadX = Math.max(10, Math.round(w * 0.08));
      const badgePadY = Math.max(8, Math.round(h * 0.08));
      const rx = x - badgePadX;
      const ry = y - badgePadY;
      const rw = w + badgePadX * 2;
      const rh = h + badgePadY * 2;
      const radius = Math.min(14, Math.round(rw * 0.14));

      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(rx, ry, rw, rh, radius);
      } else {
        ctx.rect(rx, ry, rw, rh);
      }
      ctx.fillStyle = "rgba(12, 12, 22, 0.72)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 4;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.stroke();
      ctx.restore();

      // 5. Draw logo inside the badge
      ctx.save();
      ctx.drawImage(logo, x, y, w, h);
      ctx.restore();

      return canvas.toDataURL("image/jpeg", 0.9);
    } catch (err) {
      console.warn("Logo watermark failed, returning unwatermarked image:", err);
      return imageUrl;
    }
  }

  async function generateSingleImage(index: number) {
    const item = items[index];
    if (!item) return;
    setItems((current) =>
      current.map((candidate, i) =>
        i === index ? { ...candidate, status: "generating" } : candidate
      )
    );
    try {
      const variation =
        item.slot > 1
          ? ` Daily variation ${item.slot}: use a distinctly different composition, camera angle and supporting scene.`
          : "";
      const posName = logoPosition.replace("-", " ");
      const prompt = `Day ${item.day}. ${item.imagePrompt} Brand: ${brandName}. Brand colors ${primary} and ${secondary}. Leave clean negative space in the ${posName} for the brand mark; do not generate text or a logo.${variation}`;
      const result = await generateMarketingImage(prompt, imageSize);
      if (!result.ok || !result.image) throw new Error(result.error || "Image generation failed.");
      const branded = await composeLogo(result.image.url);

      setItems((current) =>
        current.map((candidate, i) =>
          i === index ? { ...candidate, status: "ready", imageUrl: branded } : candidate
        )
      );

      // Background save to media catalog
      try {
        const saveForm = new FormData();
        saveForm.set("image_url", branded);
        saveForm.set("prompt", prompt);
        saveForm.set("provider", result.image.provider);
        saveForm.set("model", result.image.model);
        void saveGeneratedImage(saveForm).catch(() => {});
      } catch {}
    } catch (e) {
      console.warn("Single image error:", e);
      setItems((current) =>
        current.map((candidate, i) =>
          i === index ? { ...candidate, status: "error" } : candidate
        )
      );
      setError(`Picture generation failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }

  async function generateImages(customList?: MarketingItem[]) {
    const targetItems = customList && customList.length ? customList : items;
    if (!targetItems.length) return;
    setError("");
    setMessage("Generating pictures with your brand mark…");
    setProgress(0);

    for (let index = 0; index < targetItems.length; index += 1) {
      const item = targetItems[index];
      setItems((current) =>
        current.map((candidate, i) =>
          i === index ? { ...candidate, status: "generating" } : candidate
        )
      );
      try {
        const variation =
          item.slot > 1
            ? ` Daily variation ${item.slot}: use a distinctly different composition, camera angle and supporting scene.`
            : "";
        const posName = logoPosition.replace("-", " ");
        const prompt = `Day ${item.day}. ${item.imagePrompt} Brand: ${brandName}. Brand colors ${primary} and ${secondary}. Leave clean negative space in the ${posName} for the brand mark; do not generate text or a logo.${variation}`;
        const result = await generateMarketingImage(prompt, imageSize);
        if (!result.ok || !result.image) throw new Error(result.error || "Image generation failed.");
        const branded = await composeLogo(result.image.url);

        setItems((current) =>
          current.map((candidate, i) =>
            i === index ? { ...candidate, status: "ready", imageUrl: branded } : candidate
          )
        );

        // Background save
        try {
          const saveForm = new FormData();
          saveForm.set("image_url", branded);
          saveForm.set("prompt", prompt);
          saveForm.set("provider", result.image.provider);
          saveForm.set("model", result.image.model);
          void saveGeneratedImage(saveForm).catch(() => {});
        } catch {}
      } catch (e) {
        console.warn(`Image ${index + 1} generation error:`, e);
        setItems((current) =>
          current.map((candidate, i) =>
            i === index ? { ...candidate, status: "error" } : candidate
          )
        );
      }
      setProgress(Math.round(((index + 1) / targetItems.length) * 100));
    }
    setMessage("All pictures generated with your brand mark! Review the batch, then click 'Add to calendar'.");
  }

  function scheduleBatch() {
    const generated = items.filter((item) => item.imageUrl);
    if (!generated.length) return;
    startTransition(async () => {
      const rows = generated.map((item) => ({
        title: `${brandName} — Day ${item.day}${postsPerDay > 1 ? ` · Post ${item.slot}` : ""}`,
        caption: `${item.hook}\n\n${item.caption}`,
        platform,
        cta: item.cta,
        hashtags: item.hashtags,
        imageUrl: item.imageUrl || null,
        imagePrompt: item.imagePrompt,
        scheduledAt: new Date(
          `${item.suggestedDate}T${String(9 + (item.slot - 1) * 6).padStart(2, "0")}:00:00`
        ).toISOString(),
        status: "SCHEDULED" as const,
      }));
      const result = await saveMarketingPosts(rows);
      if (!result.ok) setError(result.error);
      else setMessage(`${result.count} posts added to your calendar.`);
    });
  }

  const canGenerate = brandName.trim() && description.trim() && audience.trim();

  return (
    <div className="campaign-container">
      {/* Planned Content Output Stats Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: "18px 24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--r-md)",
              background: "var(--accent-soft)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a89dff",
              flexShrink: 0,
            }}
          >
            <WandSparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              Planned Content Output
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              Automated brand campaigns &amp; watermarked visuals
            </div>
          </div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          {total}{" "}
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
            posts &middot; {duration} days &middot; {postsPerDay}/day
          </span>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "var(--r-md)",
            color: "#4ade80",
            fontSize: 13,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={16} />
            <span>{message}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage("")}
            style={{ background: "transparent", border: "none", color: "#4ade80", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "var(--r-md)",
            color: "#f87171",
            fontSize: 13,
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Grid: Left Brief Panel + Right Stage Panel */}
      <div className="campaign-grid">
        {/* LEFT COLUMN: Controls Panel */}
        <div className="campaign-brief-panel">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--r-md)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Brand &amp; Campaign Setup
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Configure your brand identity and content strategy
              </p>
            </div>
          </div>

          {/* Clean Studio Tab Toggle */}
          <div
            style={{
              display: "flex",
              gap: 6,
              background: "var(--bg-elevated)",
              padding: 4,
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              className={`studio-tab-btn ${activeTab === "brand" ? "active" : ""}`}
              style={{
                flex: 1,
                justifyContent: "center",
                padding: "8px 12px",
                fontSize: 12,
                borderRadius: "var(--r-sm)",
              }}
              onClick={() => setActiveTab("brand")}
            >
              <Palette size={14} /> Brand Identity
            </button>
            <button
              type="button"
              className={`studio-tab-btn ${activeTab === "plan" ? "active" : ""}`}
              style={{
                flex: 1,
                justifyContent: "center",
                padding: "8px 12px",
                fontSize: 12,
                borderRadius: "var(--r-sm)",
              }}
              onClick={() => setActiveTab("plan")}
            >
              <CalendarDays size={14} /> Content Plan
            </button>
          </div>

          {/* TAB 1: Brand Identity */}
          {activeTab === "brand" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Set this up once &mdash; it&apos;s reused every time you generate a multi-day marketing campaign.
              </p>

              {/* Brand Name */}
              <div>
                <div className="campaign-field-label">
                  <span>Brand Name</span>
                </div>
                <input
                  disabled={!canEdit}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Your business name"
                  className="campaign-input"
                />
              </div>

              {/* Description */}
              <div>
                <div className="campaign-field-label">
                  <span>What do you sell?</span>
                </div>
                <textarea
                  disabled={!canEdit}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Specialty coffee, pastries and cozy cafe experiences."
                  className="campaign-input"
                  style={{ resize: "vertical", minHeight: 74, lineHeight: 1.5 }}
                />
              </div>

              {/* Voice & Tone */}
              <div>
                <div className="campaign-field-label">
                  <span>Brand Voice &amp; Tone</span>
                </div>
                <input
                  disabled={!canEdit}
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="Warm, witty, premium…"
                  className="campaign-input"
                />
              </div>

              {/* 2-Column Row: Primary Color & Accent Color */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className="campaign-field-label">
                    <span>Primary Color</span>
                  </div>
                  <input
                    disabled={!canEdit}
                    type="color"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="campaign-input"
                    style={{ height: 40, padding: 4, cursor: "pointer" }}
                  />
                </div>

                <div>
                  <div className="campaign-field-label">
                    <span>Accent Color</span>
                  </div>
                  <input
                    disabled={!canEdit}
                    type="color"
                    value={secondary}
                    onChange={(e) => setSecondary(e.target.value)}
                    className="campaign-input"
                    style={{ height: 40, padding: 4, cursor: "pointer" }}
                  />
                </div>
              </div>

              {/* Brand Logo Watermark */}
              <div>
                <div className="campaign-field-label">
                  <span>Brand Logo Watermark</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <label
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderRadius: "var(--r-md)",
                      border: "1px dashed var(--border-accent)",
                      background: "rgba(255,255,255,0.02)",
                      padding: "10px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Upload size={15} style={{ color: "var(--accent)" }} />
                    <span>{logoUrl ? "Replace brand logo" : "Upload brand logo"}</span>
                    <input
                      disabled={!canEdit}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      style={{ display: "none" }}
                      onChange={(e) => void handleLogo(e.target.files?.[0])}
                    />
                  </label>
                  {logoUrl && canEdit && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--r-md)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        background: "rgba(239,68,68,0.1)",
                        color: "#f87171",
                        padding: "0 12px",
                        cursor: "pointer",
                      }}
                      title="Remove logo"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Watermark position & live preview */}
              {logoUrl && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div className="campaign-field-label">
                      <span>Watermark Position on Photos</span>
                    </div>
                    <select
                      disabled={!canEdit}
                      value={logoPosition}
                      onChange={(e) => setLogoPosition(e.target.value as typeof logoPosition)}
                      className="campaign-input"
                      style={{ height: 40 }}
                    >
                      <option value="bottom-right">Bottom-Right (Recommended)</option>
                      <option value="top-right">Top-Right</option>
                      <option value="bottom-left">Bottom-Left</option>
                      <option value="top-left">Top-Left</option>
                    </select>
                  </div>

                  {/* Watermark Mockup */}
                  <div
                    style={{
                      borderRadius: "var(--r-md)",
                      border: "1px solid var(--border)",
                      background: "var(--bg-elevated)",
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent)" }}>
                        ✦ Live Watermark Preview
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>
                        {logoPosition.replace("-", " ")}
                      </span>
                    </div>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: 140,
                        borderRadius: "var(--r-sm)",
                        overflow: "hidden",
                        background: "radial-gradient(circle at center, #2e2420 0%, #151010 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ textAlign: "center", opacity: 0.6 }}>
                        <Coffee size={32} style={{ color: "#f59e0b", margin: "0 auto" }} />
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontWeight: 500 }}>
                          Sample Coffee Post
                        </p>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 10px",
                          borderRadius: 8,
                          background: "rgba(12, 12, 22, 0.8)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                          backdropFilter: "blur(6px)",
                          ...(logoPosition === "bottom-right"
                            ? { bottom: 10, right: 10 }
                            : logoPosition === "top-right"
                            ? { top: 10, right: 10 }
                            : logoPosition === "bottom-left"
                            ? { bottom: 10, left: 10 }
                            : { top: 10, left: 10 }),
                        }}
                      >
                        <img src={logoUrl} alt="Logo preview" style={{ height: 18, maxWidth: 60, objectFit: "contain" }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#ffffff" }}>{brandName}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, textAlign: "center" }}>
                      This frosted watermark badge will be composited on every generated picture.
                    </p>
                  </div>
                </div>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={saveBrand}
                  disabled={isPending}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    borderRadius: "var(--r-md)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    padding: "11px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    marginTop: 4,
                  }}
                >
                  {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Save Brand Identity
                </button>
              )}
            </div>
          )}

          {/* TAB 2: Content Plan */}
          {activeTab === "plan" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                Tell us who you&apos;re talking to and how you want to show up &mdash; we&apos;ll build the full calendar from this.
              </p>

              {/* Target Audience */}
              <div>
                <div className="campaign-field-label">
                  <span>Target Audience</span>
                </div>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Coffee lovers, students, young professionals"
                  className="campaign-input"
                />
              </div>

              {/* 2-Column Row: Platform & Posts / Day */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className="campaign-field-label">
                    <span>Platform</span>
                  </div>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as AIPlatform)}
                    className="campaign-input"
                    style={{ height: 40 }}
                  >
                    {platforms.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="campaign-field-label">
                    <span>Posts / Day</span>
                  </div>
                  <select
                    value={postsPerDay}
                    onChange={(e) => setPostsPerDay(Number(e.target.value))}
                    className="campaign-input"
                    style={{ height: 40 }}
                  >
                    {[1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n} post{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2-Column Row: Duration (Days) & Start Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className="campaign-field-label">
                    <span>Duration (Days)</span>
                  </div>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="campaign-input"
                    style={{ height: 40 }}
                  >
                    {Array.from({ length: 30 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} day{i > 0 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="campaign-field-label">
                    <span>Start Date</span>
                  </div>
                  <input
                    type="date"
                    min={tomorrow()}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="campaign-input"
                    style={{ height: 40 }}
                  />
                </div>
              </div>

              {/* 2-Column Row: Tone of Voice & Campaign Goal */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className="campaign-field-label">
                    <span>Tone of Voice</span>
                  </div>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as AITone)}
                    className="campaign-input"
                    style={{ height: 40 }}
                  >
                    {tones.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="campaign-field-label">
                    <span>Campaign Goal</span>
                  </div>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as AIObjective)}
                    className="campaign-input"
                    style={{ height: 40 }}
                  >
                    {goals.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Aspect Ratio */}
              <div>
                <div className="campaign-field-label">
                  <span>Image Aspect Ratio</span>
                </div>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value as typeof imageSize)}
                  className="campaign-input"
                  style={{ height: 40 }}
                >
                  <option value="1024x1024">Square (1:1) — Instagram &amp; Feed</option>
                  <option value="1536x1024">Landscape (3:2) — Facebook &amp; LinkedIn</option>
                  <option value="1024x1536">Portrait (2:3) — Stories &amp; Pins</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={generatePlan}
                disabled={isPending || !canGenerate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: "var(--r-md)",
                  background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
                  padding: "13px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(109,92,255,0.35)",
                  opacity: isPending || !canGenerate ? 0.6 : 1,
                  marginTop: 4,
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={17} /> Planning {total} Content Pieces…
                  </>
                ) : items.length > 0 ? (
                  <>
                    <RefreshCw size={17} /> Regenerate {total} Content Pieces
                  </>
                ) : (
                  <>
                    <Sparkles size={17} /> Generate {total} Content Pieces
                  </>
                )}
              </button>

              {!canGenerate && (
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", textAlign: "center", margin: "2px 0 0" }}>
                  Fill in your brand name &amp; description on the <b style={{ color: "var(--text-secondary)" }}>Brand Identity</b> tab first.
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Output Studio Stage */}
        <div className="campaign-stage-panel">
          {/* Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 16,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Campaign Studio
              </span>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: "4px 0 0",
                }}
              >
                {items.length > 0 ? "Content Batch" : "Your content calendar will appear here"}
              </h2>
              {items.length > 0 && (
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  {ready}/{items.length} images generated with logo &middot; {duration} days &middot; {postsPerDay}/day
                </p>
              )}
            </div>

            {items.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="badge badge-ai"
                  style={{
                    fontSize: 11,
                    background: "rgba(16,185,129,0.15)",
                    color: "#34d399",
                    borderColor: "rgba(16,185,129,0.3)",
                  }}
                >
                  Logo Watermark Active
                </span>
              </div>
            )}
          </div>

          {/* Body Content */}
          {!items.length ? (
            /* Empty State matching campaigns page */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: "rgba(109,92,255,0.1)",
                  border: "1px solid rgba(109,92,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a89dff",
                  marginBottom: 16,
                }}
              >
                <WandSparkles size={30} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Your content calendar will appear here
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  maxWidth: 440,
                  margin: "8px 0 28px",
                  lineHeight: 1.6,
                }}
              >
                The AI crafts an engaging mix of product highlights, lifestyle moments, educational tips, and offers. Your logo is automatically stamped on every visual.
              </p>

              {/* 3 Step Highlights: 1 column on mobile, 3 columns on tablet/desktop */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-[640px]"
              >
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: "16px 14px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#a89dff", marginBottom: 4 }}>
                    1. Brand Watermark
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Your logo is automatically stamped and composited onto every visual.
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: "16px 14px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", marginBottom: 4 }}>
                    2. Multi-Day Sequence
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Structured daily content with hooks, captions, CTAs, and hashtags.
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: "16px 14px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399", marginBottom: 4 }}>
                    3. 1-Click Scheduling
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Review the batch, make adjustments, and schedule directly to your calendar.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Batch Output */
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Batch Actions Toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-lg)",
                  padding: "14px 18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CalendarDays size={18} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {ready < items.length
                      ? `${ready}/${items.length} images generated with logo`
                      : `All ${items.length} posts ready to schedule!`}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => void generateImages()}
                    disabled={isPending || items.some((i) => i.status === "generating")}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 6 }}
                  >
                    {items.some((i) => i.status === "generating") ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Generating visuals…
                      </>
                    ) : (
                      <>
                        <WandSparkles size={14} />
                        {ready === 0
                          ? `Generate All ${items.length} Pictures`
                          : ready < items.length
                          ? `Generate Remaining (${items.length - ready})`
                          : "Regenerate All Pictures"}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={scheduleBatch}
                    disabled={isPending || ready === 0}
                    className="btn btn-primary btn-sm"
                    style={{ gap: 6 }}
                  >
                    <CalendarPlus size={14} /> Add to Calendar
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              {progress > 0 && progress < 100 && (
                <div
                  style={{
                    height: 6,
                    width: "100%",
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      background: "linear-gradient(90deg, #6d5cff 0%, #a855f7 100%)",
                      width: `${progress}%`,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              )}

              {/* Items Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
                  gap: 16,
                }}
              >
                {items.map((item, index) => (
                  <article key={`${item.day}-${item.slot}`} className="campaign-day-card">
                    {/* Visual Area */}
                    <div
                      style={{
                        aspectRatio: "1/1",
                        background: "var(--bg-surface)",
                        borderRadius: "var(--r-md)",
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.contentIdea}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            onClick={() => void generateSingleImage(index)}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 8px",
                              borderRadius: "var(--r-sm)",
                              background: "rgba(0,0,0,0.75)",
                              backdropFilter: "blur(6px)",
                              color: "#ffffff",
                              fontSize: 11,
                              fontWeight: 600,
                              border: "1px solid rgba(255,255,255,0.2)",
                              cursor: "pointer",
                            }}
                            title="Regenerate this picture"
                          >
                            <RefreshCw size={11} /> Regenerate
                          </button>
                        </>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 16,
                            textAlign: "center",
                            gap: 8,
                          }}
                        >
                          {item.status === "generating" ? (
                            <>
                              <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
                              <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--accent)" }}>
                                Creating with logo…
                              </span>
                            </>
                          ) : (
                            <>
                              <ImageIcon size={24} style={{ color: "var(--text-muted)" }} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
                                Day {item.day}{postsPerDay > 1 ? ` · Post ${item.slot}` : ""}
                              </span>
                              <button
                                type="button"
                                onClick={() => void generateSingleImage(index)}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: 11, padding: "4px 10px", gap: 4 }}
                              >
                                <Sparkles size={11} /> Generate picture
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="campaign-day-header" style={{ paddingBottom: 8, borderBottom: "none" }}>
                        <span
                          className="badge badge-ai"
                          style={{ fontSize: 10, padding: "2px 8px" }}
                        >
                          Day {item.day}{postsPerDay > 1 ? ` · Post ${item.slot}` : ""}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {new Date(`${item.suggestedDate}T12:00:00`).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <h4
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          margin: 0,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.hook}
                      </h4>

                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          margin: 0,
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.caption}
                      </p>

                      <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--accent)", margin: "2px 0 0" }}>
                        &rarr; {item.cta}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingTop: 4 }}>
                        {item.hashtags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: 99,
                              padding: "2px 8px",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
