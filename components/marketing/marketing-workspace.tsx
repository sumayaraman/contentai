"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarDays, Check, ImageIcon, Loader2, Palette, Sparkles, Upload, WandSparkles } from "lucide-react";
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

const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-[#f0f0ff] placeholder-[#50507a] outline-none focus:border-[#6d5cff]/60 focus:ring-2 focus:ring-[#6d5cff]/20 transition-all";
const labelClass = "block text-xs font-semibold text-[#9090c0] mb-1.5 uppercase tracking-wider";

export function MarketingWorkspace({ workspace, canEdit }: Props) {
  const [brandName, setBrandName] = useState(workspace.brand_name || workspace.name);
  const [description, setDescription] = useState(workspace.brand_description || "");
  const [voice, setVoice] = useState(workspace.brand_voice || "Friendly, warm and professional");
  const [primary, setPrimary] = useState(workspace.brand_primary_color || "#6d5cff");
  const [secondary, setSecondary] = useState(workspace.brand_secondary_color || "#f59e0b");
  const [logoUrl, setLogoUrl] = useState(workspace.brand_logo_url || "");
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
      const result = await uploadBrandLogo(workspace.id, String(reader.result || ""));
      if (!result.ok) setError(result.error); else { setLogoUrl(result.url); setMessage("Logo saved. It will be applied to generated images."); }
    };
    reader.onerror = () => setError("Could not read the logo file.");
    reader.readAsDataURL(file);
  }

  function saveBrand() {
    setError(""); setMessage("");
    startTransition(async () => {
      const result = await updateBrandSettings(workspace.id, { brandName, description, primaryColor: primary, secondaryColor: secondary, voice });
      if (!result.ok) setError(result.error); else setMessage("Brand workspace saved.");
    });
  }

  function generatePlan() {
    setError(""); setMessage(""); setItems([]); setProgress(0);
    startTransition(async () => {
      const result = await generateMarketingPlan({ businessName: brandName, description, audience, platform, tone, goal, startDate, duration, postsPerDay, brandVoice: voice });
      if (!result.ok) { setError(result.error); return; }
      setItems(result.items.map((item) => ({ ...item, status: "pending", imageUrl: null })));
      setMessage(`Plan ready — ${result.items.length} content pieces across ${duration} days.`);
    });
  }

  async function composeLogo(imageUrl: string) {
    if (!logoUrl) return imageUrl;
    const image = new Image(); image.crossOrigin = "anonymous";
    const logo = new Image(); logo.crossOrigin = "anonymous";
    await Promise.all([
      new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Generated image could not be loaded.")); image.src = imageUrl; }),
      new Promise<void>((resolve, reject) => { logo.onload = () => resolve(); logo.onerror = () => reject(new Error("Logo could not be loaded.")); logo.src = logoUrl; })
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || 1024; canvas.height = image.naturalHeight || 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return imageUrl;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pad = Math.max(20, Math.round(canvas.width * 0.035));
    const maxW = Math.round(canvas.width * 0.18);
    const ratio = logo.naturalHeight / Math.max(1, logo.naturalWidth);
    const w = Math.min(maxW, logo.naturalWidth); const h = Math.round(w * ratio);
    ctx.save(); ctx.globalAlpha = 0.96; ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 14;
    ctx.drawImage(logo, pad, pad, w, h); ctx.restore();
    return canvas.toDataURL("image/jpeg", 0.86);
  }

  async function generateImages() {
    if (!items.length) return;
    setError(""); setMessage(""); setProgress(0);
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "generating" } : candidate));
      try {
        const variation = item.slot > 1 ? ` Daily variation ${item.slot}: use a distinctly different composition, camera angle and supporting scene.` : "";
        const prompt = `${item.imagePrompt} Brand: ${brandName}. Brand colors ${primary} and ${secondary}. Leave clean negative space in the top-left for the brand mark; do not generate text or a logo.${variation}`;
        const result = await generateMarketingImage(prompt, imageSize);
        if (!result.ok) throw new Error(result.error || "Image generation failed.");
        const branded = await composeLogo(result.image.url);
        const saveForm = new FormData();
        saveForm.set("image_url", branded); saveForm.set("prompt", prompt); saveForm.set("provider", result.image.provider); saveForm.set("model", result.image.model);
        const saved = await saveGeneratedImage(saveForm);
        if (!saved.ok) throw new Error(saved.error || "Could not save image.");
        setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "ready", imageUrl: saved.media?.url || branded } : candidate));
      } catch (e) {
        setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "error" } : candidate));
        setError(`Image ${index + 1} failed: ${e instanceof Error ? e.message : "Unknown error"}`);
        break;
      }
      setProgress(Math.round(((index + 1) / items.length) * 100));
    }
    setMessage("Images ready. Review the grid, then send the batch to your calendar.");
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
        scheduledAt: new Date(`${item.suggestedDate}T${String(9 + (item.slot - 1) * 6).padStart(2, "0")}:00:00`).toISOString(),
        status: "SCHEDULED" as const,
      }));
      const result = await saveMarketingPosts(rows);
      if (!result.ok) setError(result.error); else setMessage(`${result.count} posts added to your calendar.`);
    });
  }

  return (
    <div className="space-y-6 pb-20">

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#6d5cff]/20 via-[#16162a] to-[#a855f7]/10 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(109,92,255,0.15),transparent)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#6d5cff]/30 bg-[#6d5cff]/10 px-3 py-1 text-xs font-semibold text-[#a89dff]">
              <WandSparkles size={12} /> Brand Content Workspace
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#f0f0ff]">Your brand → a month of content</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#9090c0]">
              Save your brand once, choose posts per day, then generate a full content calendar with captions, hashtags, and branded images.
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-right backdrop-blur-sm">
            <div className="text-xs text-[#9090c0]">Planned output</div>
            <div className="mt-1 text-2xl font-bold text-[#f0f0ff]">{total} <span className="text-sm font-normal text-[#9090c0]">posts / {duration} days</span></div>
          </div>
        </div>
      </div>

      {/* Alert messages */}
      {(message || error) && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${error
          ? "border-red-500/20 bg-red-500/10 text-red-400"
          : "border-[#6d5cff]/30 bg-[#6d5cff]/10 text-[#a89dff]"}`}>
          {error || message}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">

        {/* LEFT PANEL */}
        <div className="space-y-4">

          {/* Brand identity */}
          <div className="rounded-2xl border border-white/10 bg-[#0f0f1a] p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6d5cff]/15">
                <Palette size={14} className="text-[#a89dff]" />
              </div>
              <span className="text-sm font-semibold text-[#f0f0ff]">Brand identity</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Brand name</label>
                <input disabled={!canEdit} value={brandName} onChange={e => setBrandName(e.target.value)} className={inputClass} placeholder="Your business name" />
              </div>
              <div>
                <label className={labelClass}>What do you sell?</label>
                <textarea disabled={!canEdit} value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Specialty coffee, pastries and cozy cafe experiences." className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Brand voice</label>
                <input disabled={!canEdit} value={voice} onChange={e => setVoice(e.target.value)} placeholder="Warm, witty, premium…" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Primary color</label>
                  <input disabled={!canEdit} type="color" value={primary} onChange={e => setPrimary(e.target.value)}
                    className="mt-0.5 h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 p-1.5 transition-all hover:border-white/20" />
                </div>
                <div>
                  <label className={labelClass}>Accent color</label>
                  <input disabled={!canEdit} type="color" value={secondary} onChange={e => setSecondary(e.target.value)}
                    className="mt-0.5 h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 p-1.5 transition-all hover:border-white/20" />
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-3 text-sm font-medium text-[#9090c0] transition-all hover:border-[#6d5cff]/40 hover:bg-[#6d5cff]/5 hover:text-[#a89dff]">
                <Upload size={15} />
                {logoUrl ? "Replace logo" : "Upload logo"}
                <input disabled={!canEdit} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={e => void handleLogo(e.target.files?.[0])} />
              </label>

              {logoUrl && (
                <div className="flex items-center gap-3 rounded-xl border border-[#6d5cff]/20 bg-[#6d5cff]/5 p-3">
                  <img src={logoUrl} alt="Brand logo" className="h-10 w-10 rounded-lg object-contain" />
                  <span className="text-xs text-[#9090c0]">Logo composited onto every generated image.</span>
                </div>
              )}

              {canEdit && (
                <button onClick={saveBrand} disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-semibold text-[#f0f0ff] transition-all hover:bg-white/12 disabled:opacity-40">
                  {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  Save brand
                </button>
              )}
            </div>
          </div>

          {/* Content plan */}
          <div className="rounded-2xl border border-white/10 bg-[#0f0f1a] p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15">
                <CalendarDays size={14} className="text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-[#f0f0ff]">30-day content plan</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Target audience</label>
                <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Coffee lovers, students, young professionals" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Platform</label>
                  <select value={platform} onChange={e => setPlatform(e.target.value as AIPlatform)} className={inputClass}>
                    {platforms.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Posts / day</label>
                  <select value={postsPerDay} onChange={e => setPostsPerDay(Number(e.target.value))} className={inputClass}>
                    {[1, 2, 3].map(n => <option key={n} value={n}>{n} post{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Days</label>
                  <select value={duration} onChange={e => setDuration(Number(e.target.value))} className={inputClass}>
                    {Array.from({ length: 30 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} days</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Start date</label>
                  <input type="date" min={tomorrow()} value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tone</label>
                  <select value={tone} onChange={e => setTone(e.target.value as AITone)} className={inputClass}>
                    {tones.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Goal</label>
                  <select value={goal} onChange={e => setGoal(e.target.value as AIObjective)} className={inputClass}>
                    {goals.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Image format</label>
                <select value={imageSize} onChange={e => setImageSize(e.target.value as typeof imageSize)} className={inputClass}>
                  <option value="1024x1024">Square — Instagram post</option>
                  <option value="1536x1024">Landscape</option>
                  <option value="1024x1536">Portrait</option>
                </select>
              </div>

              <button
                onClick={generatePlan}
                disabled={isPending || !brandName.trim() || !description.trim() || !audience.trim()}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6d5cff] to-[#a855f7] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#6d5cff]/20 transition-all hover:opacity-90 disabled:opacity-40">
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate {total} content pieces
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="min-w-0">
          {!items.length ? (
            <div className="flex min-h-[640px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0f0f1a] px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6d5cff]/20 to-[#a855f7]/20 shadow-lg">
                <Sparkles size={28} className="text-[#a89dff]" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#f0f0ff]">Your content calendar will appear here</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#50507a]">
                For a coffee business, the AI mixes product shots, education, customer moments, offers, behind-the-scenes and engagement posts. Your logo is composited after generation so it stays pixel-perfect.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#f0f0ff]">Content batch</h3>
                  <p className="text-xs text-[#50507a]">{ready}/{items.length} images ready · {duration} days · {postsPerDay}/day</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => void generateImages()}
                    disabled={isPending || items.some(i => i.status === "generating")}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-semibold text-[#f0f0ff] transition-all hover:bg-white/10 disabled:opacity-40">
                    <ImageIcon size={15} />
                    {ready ? "Regenerate images" : "Generate all images"}
                  </button>
                  <button
                    onClick={scheduleBatch}
                    disabled={isPending || ready !== items.length}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6d5cff] to-[#a855f7] px-3.5 py-2 text-sm font-bold text-white shadow-lg shadow-[#6d5cff]/20 transition-all hover:opacity-90 disabled:opacity-40">
                    <CalendarDays size={15} />
                    Add all to calendar
                  </button>
                </div>
              </div>

              {progress > 0 && progress < 100 && (
                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#6d5cff] to-[#a855f7] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item, index) => (
                  <article key={`${item.day}-${item.slot}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f1a] transition-all hover:border-[#6d5cff]/30 hover:shadow-lg hover:shadow-[#6d5cff]/5">
                    <div className="aspect-square bg-[#16162a]">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.contentIdea} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center px-5 text-center text-[#50507a]">
                          {item.status === "generating"
                            ? <Loader2 size={24} className="animate-spin text-[#6d5cff]" />
                            : <ImageIcon size={24} />}
                          <span className="mt-2 text-xs font-semibold">
                            Day {item.day}{postsPerDay > 1 ? ` · Post ${item.slot}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#6d5cff]">
                          Day {item.day}{postsPerDay > 1 ? ` · ${item.slot}` : ""}
                        </span>
                        <span className="text-[10px] text-[#50507a]">
                          {new Date(`${item.suggestedDate}T12:00:00`).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="mt-2 line-clamp-2 text-sm font-bold text-[#f0f0ff]">{item.hook}</h4>
                      <p className="mt-2 line-clamp-4 whitespace-pre-line text-xs leading-5 text-[#9090c0]">{item.caption}</p>
                      <p className="mt-2 line-clamp-1 text-xs font-semibold text-[#6d5cff]">→ {item.cta}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.hashtags.slice(0, 4).map(tag => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[#9090c0]">{tag}</span>
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