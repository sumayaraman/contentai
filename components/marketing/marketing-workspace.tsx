"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarDays, Check, Coffee, ImageIcon, Loader2, Palette, Sparkles, Upload, WandSparkles, X } from "lucide-react";
import { generateMarketingImage, generateMarketingPlan, saveMarketingPosts } from "@/lib/marketing/actions";
import { saveGeneratedImage } from "@/lib/image/actions";
import { updateBrandSettings, uploadBrandLogo } from "@/lib/workspace/brand-actions";
import type { AIObjective, AIPlatform, AITone, CampaignDay } from "@/ai/types";

type MarketingItem = CampaignDay & { slot: number; imageUrl?: string | null; status?: "pending" | "generating" | "ready" | "error" };

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

const platforms: Array<[AIPlatform, string]> = [["INSTAGRAM", "Instagram"], ["FACEBOOK", "Facebook"], ["LINKEDIN", "LinkedIn"], ["X", "X"]];
const tones: Array<[AITone, string]> = [["FRIENDLY", "Friendly"], ["PROFESSIONAL", "Professional"], ["CASUAL", "Casual"], ["FUNNY", "Playful"], ["INSPIRATIONAL", "Inspirational"], ["EDUCATIONAL", "Educational"], ["LUXURY", "Luxury"]];
const goals: Array<[AIObjective, string]> = [["AWARENESS", "Brand awareness"], ["ENGAGEMENT", "Engagement"], ["SALES", "Sales"], ["TRAFFIC", "Traffic"], ["LEADS", "Leads"], ["BRAND_BUILDING", "Brand building"]];

const tomorrow = () => { const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10); };

const inputClass = "h-13 w-full rounded-2xl border border-white/10 bg-[#16162a] px-4 sm:px-5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 disabled:opacity-40";
const labelClass = "block text-xs font-semibold text-white/70 mb-2";

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
  const previewDays = useMemo(() => Array.from(new Set(items.map((item) => item.day))).slice(0, 30), [items]);

  async function handleLogo(file: File | undefined) {
    if (!file || !canEdit) return;
    setError(""); setMessage("Uploading logo…");
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
    setError(""); setMessage("");
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
    setError(""); setMessage(""); setItems([]); setProgress(0);
    startTransition(async () => {
      const result = await generateMarketingPlan({ businessName: brandName, description, audience, platform, tone, goal, startDate, duration, postsPerDay, brandVoice: voice });
      if (!result.ok) { setError(result.error); return; }
      const newItems: MarketingItem[] = result.items.map((item) => ({ ...item, status: "pending", imageUrl: null }));
      setItems(newItems);
      setMessage(`Plan ready! Generating branded pictures for all ${newItems.length} days with your logo…`);
      // Automatically generate the pictures with logo
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
    setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "generating" } : candidate));
    try {
      const variation = item.slot > 1 ? ` Daily variation ${item.slot}: use a distinctly different composition, camera angle and supporting scene.` : "";
      const posName = logoPosition.replace("-", " ");
      const prompt = `Day ${item.day}. ${item.imagePrompt} Brand: ${brandName}. Brand colors ${primary} and ${secondary}. Leave clean negative space in the ${posName} for the brand mark; do not generate text or a logo.${variation}`;
      const result = await generateMarketingImage(prompt, imageSize);
      if (!result.ok || !result.image) throw new Error(result.error || "Image generation failed.");
      const branded = await composeLogo(result.image.url);

      setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "ready", imageUrl: branded } : candidate));

      // Attempt background save without blocking
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
      setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "error" } : candidate));
      setError(`Picture generation failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }

  async function generateImages(customList?: MarketingItem[]) {
    const targetItems = customList && customList.length ? customList : items;
    if (!targetItems.length) return;
    setError(""); setMessage("Generating pictures with your brand mark…"); setProgress(0);

    for (let index = 0; index < targetItems.length; index += 1) {
      const item = targetItems[index];
      setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "generating" } : candidate));
      try {
        const variation = item.slot > 1 ? ` Daily variation ${item.slot}: use a distinctly different composition, camera angle and supporting scene.` : "";
        const posName = logoPosition.replace("-", " ");
        const prompt = `Day ${item.day}. ${item.imagePrompt} Brand: ${brandName}. Brand colors ${primary} and ${secondary}. Leave clean negative space in the ${posName} for the brand mark; do not generate text or a logo.${variation}`;
        const result = await generateMarketingImage(prompt, imageSize);
        if (!result.ok || !result.image) throw new Error(result.error || "Image generation failed.");
        const branded = await composeLogo(result.image.url);

        // Immediately show the image on the card!
        setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "ready", imageUrl: branded } : candidate));

        // Background save to media catalog (non-blocking)
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
        setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "error" } : candidate));
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
        platform, cta: item.cta, hashtags: item.hashtags,
        imageUrl: item.imageUrl || null, imagePrompt: item.imagePrompt,
        scheduledAt: new Date(`${item.suggestedDate}T${String(9 + (item.slot - 1) * 6).padStart(2, "0")}:00:00`).toISOString(),
        status: "SCHEDULED" as const,
      }));
      const result = await saveMarketingPosts(rows);
      if (!result.ok) setError(result.error); else setMessage(`${result.count} posts added to your calendar.`);
    });
  }

  const canGenerate = brandName.trim() && description.trim() && audience.trim();

  return (
    <div className="space-y-10">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-[#14142a]/80 to-indigo-500/10 p-6 backdrop-blur-2xl shadow-xl shadow-black/30">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-md shadow-violet-500/20">
            <WandSparkles size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Planned Content Output</div>
            <div className="text-xs text-violet-300/70 mt-0.5">Automated brand campaigns &amp; watermarked visuals</div>
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {total} <span className="text-xs sm:text-sm font-normal text-white/50">posts &middot; {duration} days &middot; {postsPerDay}/day</span>
        </div>
      </div>

      {/* Alert */}
      {(message || error) && (
        <div
          className={`rounded-2xl border px-5 py-4 text-xs sm:text-sm font-medium backdrop-blur-xl transition-all ${
            error
              ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
              : "border-violet-500/30 bg-violet-500/10 text-violet-200"
          }`}
        >
          {error || message}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT — tabbed card: Brand / Plan */}
        <div className="lg:col-span-5 rounded-3xl border border-white/[0.08] bg-[#101020]/80 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b border-white/[0.08] bg-white/[0.02]">
            <button
              type="button"
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "brand"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 scale-[1.01]"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
              onClick={() => setActiveTab("brand")}
            >
              <Palette size={15} />
              <span>Brand Identity</span>
            </button>
            <button
              type="button"
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "plan"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 scale-[1.01]"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
              onClick={() => setActiveTab("plan")}
            >
              <CalendarDays size={15} />
              <span>Content Plan</span>
            </button>
          </div>

          {activeTab === "brand" ? (
            <div className="p-6 sm:p-8 space-y-6">
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                Set this up once &mdash; it&apos;s reused every time you generate a multi-day marketing campaign.
              </p>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Brand Name</label>
                  <input
                    disabled={!canEdit}
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Your business name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>What do you sell?</label>
                  <textarea
                    disabled={!canEdit}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Specialty coffee, pastries and cozy cafe experiences."
                    className="w-full rounded-2xl border border-white/10 bg-[#16162a] p-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 disabled:opacity-40 resize-y"
                  />
                </div>

                <div>
                  <label className={labelClass}>Brand Voice &amp; Tone</label>
                  <input
                    disabled={!canEdit}
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    placeholder="Warm, witty, premium…"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        disabled={!canEdit}
                        type="color"
                        value={primary}
                        onChange={(e) => setPrimary(e.target.value)}
                        className="h-13 w-full rounded-2xl border border-white/10 bg-[#16162a] p-2 cursor-pointer transition focus:border-violet-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        disabled={!canEdit}
                        type="color"
                        value={secondary}
                        onChange={(e) => setSecondary(e.target.value)}
                        className="h-13 w-full rounded-2xl border border-white/10 bg-[#16162a] p-2 cursor-pointer transition focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Brand Logo Watermark</label>
                  <div className="flex gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.06] py-3.5 px-4 text-xs sm:text-sm font-medium text-white/70 hover:text-white transition cursor-pointer">
                      <Upload size={16} className="text-violet-400" />
                      <span>{logoUrl ? "Replace brand logo" : "Upload brand logo"}</span>
                      <input
                        disabled={!canEdit}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={(e) => void handleLogo(e.target.files?.[0])}
                      />
                    </label>
                    {logoUrl && canEdit && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl("")}
                        className="flex items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 px-4 text-rose-300 transition cursor-pointer"
                        title="Remove logo"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {logoUrl && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className={labelClass}>Watermark Position on Photos</label>
                      <select
                        disabled={!canEdit}
                        value={logoPosition}
                        onChange={(e) => setLogoPosition(e.target.value as typeof logoPosition)}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="bottom-right" className="bg-[#16162a] text-white">Bottom-Right (Recommended)</option>
                        <option value="top-right" className="bg-[#16162a] text-white">Top-Right</option>
                        <option value="bottom-left" className="bg-[#16162a] text-white">Bottom-Left</option>
                        <option value="top-left" className="bg-[#16162a] text-white">Top-Left</option>
                      </select>
                    </div>

                    {/* Live Watermark Preview Mockup */}
                    <div className="rounded-2xl border border-violet-500/25 bg-[#0a0a14] p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-violet-300">✦ Live Watermark Preview</span>
                        <span className="text-white/40 text-[11px] capitalize">{logoPosition.replace("-", " ")}</span>
                      </div>
                      <div className="relative w-full h-40 rounded-xl overflow-hidden bg-radial from-[#3d2b26] to-[#171110] flex items-center justify-center border border-white/[0.06]">
                        <div className="opacity-60 text-center">
                          <Coffee size={36} className="text-amber-500 mx-auto" />
                          <p className="text-[11px] text-white/80 mt-1.5 font-medium">Sample Coffee Post</p>
                        </div>
                        <div
                          className="absolute flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c0c16]/80 border border-white/20 shadow-xl backdrop-blur-md"
                          style={{
                            ...(logoPosition === "bottom-right" ? { bottom: 12, right: 12 } :
                                logoPosition === "top-right" ? { top: 12, right: 12 } :
                                logoPosition === "bottom-left" ? { bottom: 12, left: 12 } :
                                { top: 12, left: 12 })
                          }}
                        >
                          <img src={logoUrl} alt="Logo preview" className="h-5 max-w-[65px] object-contain" />
                          <span className="text-[11px] font-bold text-white">{brandName}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-white/40 text-center">
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
                    className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.08] hover:bg-white/[0.14] text-sm font-semibold text-white transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer pt-1"
                  >
                    {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Save Brand Identity
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6">
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                Tell us who you&apos;re talking to and how you want to show up &mdash; we&apos;ll build the full calendar from this.
              </p>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Target Audience</label>
                  <input
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="Coffee lovers, students, young professionals"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as AIPlatform)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {platforms.map(([v, l]) => (
                        <option key={v} value={v} className="bg-[#16162a] text-white">{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Posts / Day</label>
                    <select
                      value={postsPerDay}
                      onChange={(e) => setPostsPerDay(Number(e.target.value))}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {[1, 2, 3].map((n) => (
                        <option key={n} value={n} className="bg-[#16162a] text-white">
                          {n} post{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Duration (Days)</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {Array.from({ length: 30 }, (_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-[#16162a] text-white">
                          {i + 1} day{i > 0 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="date"
                      min={tomorrow()}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`${inputClass} cursor-pointer`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tone of Voice</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as AITone)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {tones.map(([v, l]) => (
                        <option key={v} value={v} className="bg-[#16162a] text-white">{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Campaign Goal</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as AIObjective)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {goals.map(([v, l]) => (
                        <option key={v} value={v} className="bg-[#16162a] text-white">{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Image Aspect Ratio</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as typeof imageSize)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="1024x1024" className="bg-[#16162a] text-white">Square (1:1) — Instagram &amp; Feed</option>
                    <option value="1536x1024" className="bg-[#16162a] text-white">Landscape (3:2) — Facebook &amp; LinkedIn</option>
                    <option value="1024x1536" className="bg-[#16162a] text-white">Portrait (2:3) — Stories &amp; Pins</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={generatePlan}
                  disabled={isPending || !canGenerate}
                  title={!canGenerate ? "Fill in brand name, description (Brand tab) and target audience first" : undefined}
                  className="h-13 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-sm font-semibold text-white transition flex items-center justify-center gap-2.5 shadow-xl shadow-violet-500/25 disabled:opacity-40 cursor-pointer pt-1"
                >
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Generate {total} Content Pieces
                </button>
                {!canGenerate && (
                  <p className="text-xs text-white/40 text-center">
                    Fill in your brand name &amp; description on the <b className="text-white/70">Brand Identity</b> tab first.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Content Calendar & Batch Area */}
        <div className="lg:col-span-7 min-w-0 space-y-6">
          {!items.length ? (
            <div className="flex flex-col items-center justify-center min-h-[480px] rounded-3xl border border-dashed border-white/15 bg-[#101020]/60 p-10 sm:p-14 text-center backdrop-blur-xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-300 shadow-xl shadow-violet-500/10 mb-5">
                <Sparkles size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Your content calendar will appear here</h3>
              <p className="text-xs sm:text-sm text-white/50 mt-3 leading-relaxed max-w-md">
                The AI crafts an engaging mix of product highlights, lifestyle moments, educational tips, and offers. Your logo is automatically stamped on every visual.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Batch Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-white/[0.08] bg-[#101020]/80 backdrop-blur-2xl shadow-xl shadow-black/30">
                <div>
                  <div className="text-sm sm:text-base font-bold text-white">Content Batch</div>
                  <div className="text-xs text-violet-300/80 mt-1">
                    {ready}/{items.length} images generated with logo &middot; {duration} days &middot; {postsPerDay}/day
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void generateImages()}
                    disabled={isPending || items.some((i) => i.status === "generating")}
                    className={`inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      ready < items.length
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500"
                        : "border border-white/10 bg-white/[0.08] text-white hover:bg-white/[0.14]"
                    }`}
                  >
                    {items.some((i) => i.status === "generating") ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Generating visuals…
                      </>
                    ) : (
                      <>
                        <WandSparkles size={15} />
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
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl border border-white/10 bg-white/[0.08] hover:bg-white/[0.14] text-xs sm:text-sm font-semibold text-white transition disabled:opacity-40 cursor-pointer"
                  >
                    <CalendarDays size={15} />
                    <span>Add to Calendar</span>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              {progress > 0 && progress < 100 && (
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {items.map((item, index) => (
                  <article
                    key={`${item.day}-${item.slot}`}
                    className="flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#101020]/80 backdrop-blur-xl overflow-hidden shadow-xl hover:border-violet-500/30 transition-all duration-200"
                  >
                    <div className="aspect-square bg-[#0a0a14] relative overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.contentIdea}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => void generateSingleImage(index)}
                            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white/90 hover:text-white hover:bg-black/90 text-xs font-medium border border-white/20 shadow-lg transition cursor-pointer"
                            title="Regenerate this picture"
                          >
                            ↻ Regenerate
                          </button>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-white/40 gap-3">
                          {item.status === "generating" ? (
                            <>
                              <Loader2 size={26} className="animate-spin text-violet-400" />
                              <span className="text-xs font-semibold text-violet-300">Creating with logo…</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon size={26} className="text-white/20" />
                              <span className="text-xs font-semibold text-white/60">
                                Day {item.day}{postsPerDay > 1 ? ` · Post ${item.slot}` : ""}
                              </span>
                              <button
                                type="button"
                                onClick={() => void generateSingleImage(index)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3.5 py-1.5 text-xs font-semibold shadow-md shadow-violet-500/25 transition cursor-pointer"
                              >
                                <Sparkles size={12} /> Generate picture
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Day {item.day}{postsPerDay > 1 ? ` · Post ${item.slot}` : ""}
                        </span>
                        <span className="text-xs text-white/40">
                          {new Date(`${item.suggestedDate}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                        {item.hook}
                      </h4>
                      <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                        {item.caption}
                      </p>
                      <p className="text-xs font-semibold text-violet-400">
                        &rarr; {item.cta}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.hashtags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-white/50"
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