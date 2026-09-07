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
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";
const tomorrow = () => { const date = new Date(); date.setDate(date.getDate() + 1); return date.toISOString().slice(0, 10); };

export function MarketingWorkspace({ workspace, canEdit }: Props) {
  const [brandName, setBrandName] = useState(workspace.brand_name || workspace.name);
  const [description, setDescription] = useState(workspace.brand_description || "");
  const [voice, setVoice] = useState(workspace.brand_voice || "Friendly, warm and professional");
  const [primary, setPrimary] = useState(workspace.brand_primary_color || "#111827");
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
      setMessage(`Plan ready: ${result.items.length} unique content pieces across ${duration} days.`);
    });
  }

  async function composeLogo(imageUrl: string) {
    if (!logoUrl) return imageUrl;
    const image = new Image();
    image.crossOrigin = "anonymous";
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    await Promise.all([new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Generated image could not be loaded.")); image.src = imageUrl; }), new Promise<void>((resolve, reject) => { logo.onload = () => resolve(); logo.onerror = () => reject(new Error("Logo could not be loaded.")); logo.src = logoUrl; })]);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || 1024; canvas.height = image.naturalHeight || 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return imageUrl;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pad = Math.max(20, Math.round(canvas.width * 0.035));
    const maxW = Math.round(canvas.width * 0.18);
    const ratio = logo.naturalHeight / Math.max(1, logo.naturalWidth);
    const w = Math.min(maxW, logo.naturalWidth); const h = Math.round(w * ratio);
    ctx.save(); ctx.globalAlpha = 0.96; ctx.shadowColor = "rgba(0,0,0,.16)"; ctx.shadowBlur = 14; ctx.drawImage(logo, pad, pad, w, h); ctx.restore();
    return canvas.toDataURL("image/jpeg", 0.86);
  }

  async function generateImages() {
    if (!items.length) return;
    setError(""); setMessage(""); setProgress(0);
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      setItems((current) => current.map((candidate, i) => i === index ? { ...candidate, status: "generating" } : candidate));
      try {
        const variation = item.slot > 1 ? ` Daily variation ${item.slot}: use a distinctly different composition, camera angle and supporting coffee scene.` : "";
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
    setMessage("Image generation finished. Review the grid, then send the batch to your calendar.");
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

  return <div className="space-y-6 pb-20">
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-950 px-6 py-7 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-violet-300"><WandSparkles size={14}/> Brand Content Workspace</div><h2 className="text-2xl font-bold tracking-tight">Build a month of marketing in one workflow.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Save your brand once, choose how many posts you want each day, then generate a complete content calendar with captions, hashtags and branded images.</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><div className="text-slate-400">Planned output</div><div className="mt-1 text-xl font-bold">{total} posts <span className="text-sm font-normal text-slate-400">/ {duration} days</span></div></div>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2"><Palette size={16} className="text-violet-600"/><span className="text-sm font-semibold text-slate-900">Brand identity</span></div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-wide text-slate-500">Business / brand name<input disabled={!canEdit} value={brandName} onChange={e=>setBrandName(e.target.value)} className={`${inputClass} mt-2`}/></label>
            <label className="mb-3 block text-xs font-bold uppercase tracking-wide text-slate-500">What does your business sell?<textarea disabled={!canEdit} value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="Specialty coffee, pastries and cozy cafe experiences." className={`${inputClass} mt-2 resize-y`}/></label>
            <label className="mb-3 block text-xs font-bold uppercase tracking-wide text-slate-500">Brand voice<input disabled={!canEdit} value={voice} onChange={e=>setVoice(e.target.value)} placeholder="Warm, witty, premium…" className={`${inputClass} mt-2`}/></label>
            <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Primary<input disabled={!canEdit} type="color" value={primary} onChange={e=>setPrimary(e.target.value)} className="mt-2 h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"/></label><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Accent<input disabled={!canEdit} type="color" value={secondary} onChange={e=>setSecondary(e.target.value)} className="mt-2 h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-1"/></label></div>
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Upload size={16}/>{logoUrl ? "Replace logo" : "Upload logo"}<input disabled={!canEdit} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={e=>void handleLogo(e.target.files?.[0])}/></label>
            {logoUrl && <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><img src={logoUrl} alt="Brand logo" className="h-12 w-12 rounded-lg object-contain"/><span className="text-xs text-slate-500">This logo is composited onto every generated image.</span></div>}
            {canEdit && <button onClick={saveBrand} disabled={isPending} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{isPending?<Loader2 size={16} className="animate-spin"/>:<Check size={16}/>}Save brand</button>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center gap-2"><CalendarDays size={16} className="text-blue-600"/><span className="text-sm font-semibold text-slate-900">30-day content plan</span></div>
            <label className="mb-3 block text-xs font-bold uppercase tracking-wide text-slate-500">Target audience<input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="Coffee lovers, students, young professionals" className={`${inputClass} mt-2`}/></label>
            <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Platform<select value={platform} onChange={e=>setPlatform(e.target.value as AIPlatform)} className={`${inputClass} mt-2`}>{platforms.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Posts / day<select value={postsPerDay} onChange={e=>setPostsPerDay(Number(e.target.value))} className={`${inputClass} mt-2`}>{[1,2,3].map(n=><option key={n} value={n}>{n} post{n>1?'s':''}</option>)}</select></label></div>
            <div className="grid grid-cols-2 gap-3 mt-3"><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Days<select value={duration} onChange={e=>setDuration(Number(e.target.value))} className={`${inputClass} mt-2`}>{Array.from({length:30},(_,i)=><option key={i+1} value={i+1}>{i+1} days</option>)}</select></label><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Start date<input type="date" min={tomorrow()} value={startDate} onChange={e=>setStartDate(e.target.value)} className={`${inputClass} mt-2`}/></label></div>
            <div className="grid grid-cols-2 gap-3 mt-3"><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Tone<select value={tone} onChange={e=>setTone(e.target.value as AITone)} className={`${inputClass} mt-2`}>{tones.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Goal<select value={goal} onChange={e=>setGoal(e.target.value as AIObjective)} className={`${inputClass} mt-2`}>{goals.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div>
            <label className="mt-3 block text-xs font-bold uppercase tracking-wide text-slate-500">Image format<select value={imageSize} onChange={e=>setImageSize(e.target.value as typeof imageSize)} className={`${inputClass} mt-2`}><option value="1024x1024">Square — Instagram post</option><option value="1536x1024">Landscape</option><option value="1024x1536">Portrait</option></select></label>
            <button onClick={generatePlan} disabled={isPending || !brandName.trim() || !description.trim() || !audience.trim()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"><Sparkles size={17}/>Generate {total} content pieces</button>
          </div>
        </div>

        <div className="min-w-0">
          {(message || error) && <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${error ? "border border-red-100 bg-red-50 text-red-700" : "border border-blue-100 bg-blue-50 text-blue-700"}`}>{error || message}</div>}
          {!items.length ? <div className="flex min-h-[650px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm"><Sparkles size={25}/></div><h3 className="mt-5 text-lg font-bold text-slate-900">Your content calendar will appear here</h3><p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">For a coffee business, the AI can mix product shots, education, customer moments, offers, behind-the-scenes content and engagement posts. Your logo is added after image generation so the exact logo stays consistent.</p></div> : <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-950">Content batch</h3><p className="text-xs text-slate-500">{ready}/{items.length} images ready · {duration} days · {postsPerDay}/day</p></div><div className="flex gap-2"><button onClick={()=>void generateImages()} disabled={isPending || items.some(i=>i.status === "generating")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"><ImageIcon size={16}/>{ready ? "Regenerate images" : "Generate all images"}</button><button onClick={scheduleBatch} disabled={isPending || ready !== items.length} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><CalendarDays size={16}/>Add all to calendar</button></div></div>
            {progress > 0 && progress < 100 && <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-all" style={{width:`${progress}%`}}/></div>}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item,index)=><article key={`${item.day}-${item.slot}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="aspect-square bg-slate-100">{item.imageUrl?<img src={item.imageUrl} alt={item.contentIdea} className="h-full w-full object-cover"/>:<div className="flex h-full flex-col items-center justify-center px-5 text-center text-slate-400">{item.status === "generating"?<Loader2 size={24} className="animate-spin"/>:<ImageIcon size={25}/>}<span className="mt-2 text-xs font-semibold">Day {item.day}{postsPerDay>1?` · Post ${item.slot}`:""}</span></div>}</div><div className="p-4"><div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold uppercase tracking-wide text-violet-600">Day {item.day}{postsPerDay>1?` · ${item.slot}`:""}</span><span className="text-[11px] text-slate-400">{new Date(`${item.suggestedDate}T12:00:00`).toLocaleDateString()}</span></div><h4 className="mt-2 line-clamp-2 text-sm font-bold text-slate-900">{item.hook}</h4><p className="mt-2 line-clamp-4 whitespace-pre-line text-xs leading-5 text-slate-500">{item.caption}</p><p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-700">CTA: {item.cta}</p><div className="mt-3 flex flex-wrap gap-1">{item.hashtags.slice(0,5).map(tag=><span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{tag}</span>)}</div></div></article>)}</div>
          </div>}
        </div>
      </div>
    </section>
  </div>;
}
