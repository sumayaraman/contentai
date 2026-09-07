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

const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#f0f0ff] placeholder-[#50507a] outline-none focus:border-[#6d5cff]/60 focus:ring-2 focus:ring-[#6d5cff]/20 transition-all";
const labelClass = "block text-xs font-semibold text-[#9090c0] mb-2 uppercase tracking-wider";

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
        platform, cta: item.cta, hashtags: item.hashtags,
        imageUrl: item.imageUrl || null, imagePrompt: item.imagePrompt,
        scheduledAt: new Date(`${item.suggestedDate}T${String(9 + (item.slot - 1) * 6).padStart(2, "0")}:00:00`).toISOString(),
        status: "SCHEDULED" as const,
      }));
      const result = await saveMarketingPosts(rows);
      if (!result.ok) setError(result.error); else setMessage(`${result.count} posts added to your calendar.`);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 80 }}>

      {/* Stats bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(109,92,255,0.08)", border: "1px solid rgba(109,92,255,0.2)", borderRadius: 16, padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a89dff", fontSize: 13, fontWeight: 600 }}>
          <WandSparkles size={15} /> Planned output
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#f0f0ff" }}>
          {total} <span style={{ fontSize: 13, fontWeight: 400, color: "#9090c0" }}>posts · {duration} days · {postsPerDay}/day</span>
        </div>
      </div>

      {/* Alert */}
      {(message || error) && (
        <div style={{ borderRadius: 12, padding: "12px 16px", fontSize: 13, fontWeight: 500, border: error ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(109,92,255,0.3)", background: error ? "rgba(239,68,68,0.08)" : "rgba(109,92,255,0.08)", color: error ? "#f87171" : "#a89dff" }}>
          {error || message}
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>

        {/* LEFT — Brand + Plan */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Brand identity card */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(109,92,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Palette size={15} color="#a89dff" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0ff" }}>Brand identity</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div className={labelClass}>Brand name</div>
                <input disabled={!canEdit} value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Your business name" className={inputClass} />
              </div>
              <div>
                <div className={labelClass}>What do you sell?</div>
                <textarea disabled={!canEdit} value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Specialty coffee, pastries and cozy cafe experiences." className={inputClass} style={{ resize: "vertical" }} />
              </div>
              <div>
                <div className={labelClass}>Brand voice</div>
                <input disabled={!canEdit} value={voice} onChange={e => setVoice(e.target.value)} placeholder="Warm, witty, premium…" className={inputClass} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className={labelClass}>Primary</div>
                  <input disabled={!canEdit} type="color" value={primary} onChange={e => setPrimary(e.target.value)} style={{ width: "100%", height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", padding: 6, cursor: "pointer" }} />
                </div>
                <div>
                  <div className={labelClass}>Accent</div>
                  <input disabled={!canEdit} type="color" value={secondary} onChange={e => setSecondary(e.target.value)} style={{ width: "100%", height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", padding: 6, cursor: "pointer" }} />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, border: "1px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)", padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#9090c0", cursor: "pointer", transition: "all 0.2s" }}>
                <Upload size={14} />
                {logoUrl ? "Replace logo" : "Upload logo"}
                <input disabled={!canEdit} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" style={{ display: "none" }} onChange={e => void handleLogo(e.target.files?.[0])} />
              </label>

              {logoUrl && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, border: "1px solid rgba(109,92,255,0.2)", background: "rgba(109,92,255,0.05)", padding: 12 }}>
                  <img src={logoUrl} alt="Brand logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }} />
                  <span style={{ fontSize: 12, color: "#9090c0" }}>Logo will be added to every generated image.</span>
                </div>
              )}

              {canEdit && (
                <button onClick={saveBrand} disabled={isPending} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", padding: "11px 16px", fontSize: 13, fontWeight: 600, color: "#f0f0ff", cursor: "pointer", opacity: isPending ? 0.5 : 1, transition: "all 0.2s" }}>
                  {isPending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                  Save brand
                </button>
              )}
            </div>
          </div>

          {/* Content plan card */}
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(96,165,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CalendarDays size={15} color="#60a5fa" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f0f0ff" }}>30-day content plan</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div className={labelClass}>Target audience</div>
                <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Coffee lovers, students, young professionals" className={inputClass} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className={labelClass}>Platform</div>
                  <select value={platform} onChange={e => setPlatform(e.target.value as AIPlatform)} className={inputClass}>
                    {platforms.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Posts / day</div>
                  <select value={postsPerDay} onChange={e => setPostsPerDay(Number(e.target.value))} className={inputClass}>
                    {[1, 2, 3].map(n => <option key={n} value={n}>{n} post{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className={labelClass}>Days</div>
                  <select value={duration} onChange={e => setDuration(Number(e.target.value))} className={inputClass}>
                    {Array.from({ length: 30 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} days</option>)}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Start date</div>
                  <input type="date" min={tomorrow()} value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div className={labelClass}>Tone</div>
                  <select value={tone} onChange={e => setTone(e.target.value as AITone)} className={inputClass}>
                    {tones.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <div className={labelClass}>Goal</div>
                  <select value={goal} onChange={e => setGoal(e.target.value as AIObjective)} className={inputClass}>
                    {goals.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className={labelClass}>Image format</div>
                <select value={imageSize} onChange={e => setImageSize(e.target.value as typeof imageSize)} className={inputClass}>
                  <option value="1024x1024">Square — Instagram post</option>
                  <option value="1536x1024">Landscape</option>
                  <option value="1024x1536">Portrait</option>
                </select>
              </div>

              <button onClick={generatePlan} disabled={isPending || !brandName.trim() || !description.trim() || !audience.trim()}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)", padding: "13px 16px", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer", border: "none", opacity: (isPending || !brandName.trim() || !description.trim() || !audience.trim()) ? 0.5 : 1, boxShadow: "0 4px 20px rgba(109,92,255,0.25)", transition: "all 0.2s", marginTop: 4 }}>
                {isPending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={16} />}
                Generate {total} content pieces
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Content grid */}
        <div>
          {!items.length ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 600, borderRadius: 20, border: "1px dashed rgba(255,255,255,0.1)", background: "var(--bg-surface)", padding: 40, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, rgba(109,92,255,0.2), rgba(168,85,247,0.2))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Sparkles size={28} color="#a89dff" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f0f0ff", margin: 0 }}>Your content calendar will appear here</h3>
              <p style={{ fontSize: 13, color: "#50507a", marginTop: 10, lineHeight: 1.7, maxWidth: 420 }}>
                For a coffee business, the AI mixes product shots, education, customer moments, offers, behind-the-scenes and engagement posts. Your logo is composited after generation so it stays pixel-perfect.
              </p>
            </div>
          ) : (
            <div>
              {/* Toolbar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#f0f0ff", fontSize: 15 }}>Content batch</div>
                  <div style={{ fontSize: 12, color: "#50507a", marginTop: 2 }}>{ready}/{items.length} images ready · {duration} days · {postsPerDay}/day</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => void generateImages()} disabled={isPending || items.some(i => i.status === "generating")}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", padding: "9px 14px", fontSize: 13, fontWeight: 600, color: "#f0f0ff", cursor: "pointer", opacity: isPending ? 0.5 : 1 }}>
                    <ImageIcon size={14} />{ready ? "Regenerate" : "Generate images"}
                  </button>
                  <button onClick={scheduleBatch} disabled={isPending || ready !== items.length}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 10, background: "linear-gradient(135deg, #6d5cff, #a855f7)", padding: "9px 14px", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", border: "none", opacity: (isPending || ready !== items.length) ? 0.4 : 1, boxShadow: "0 4px 16px rgba(109,92,255,0.25)" }}>
                    <CalendarDays size={14} />Add to calendar
                  </button>
                </div>
              </div>

              {/* Progress */}
              {progress > 0 && progress < 100 && (
                <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", marginBottom: 16, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #6d5cff, #a855f7)", width: `${progress}%`, transition: "width 0.3s" }} />
                </div>
              )}

              {/* Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                {items.map((item) => (
                  <article key={`${item.day}-${item.slot}`} style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "var(--bg-surface)", overflow: "hidden", transition: "border-color 0.2s" }}>
                    <div style={{ aspectRatio: "1", background: "var(--bg-elevated)" }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.contentIdea} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#50507a" }}>
                          {item.status === "generating" ? <Loader2 size={22} style={{ animation: "spin 1s linear infinite", color: "#6d5cff" }} /> : <ImageIcon size={22} />}
                          <span style={{ marginTop: 8, fontSize: 11, fontWeight: 600 }}>Day {item.day}{postsPerDay > 1 ? ` · ${item.slot}` : ""}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6d5cff" }}>Day {item.day}{postsPerDay > 1 ? ` · ${item.slot}` : ""}</span>
                        <span style={{ fontSize: 10, color: "#50507a" }}>{new Date(`${item.suggestedDate}T12:00:00`).toLocaleDateString()}</span>
                      </div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#f0f0ff", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.hook}</h4>
                      <p style={{ fontSize: 11, color: "#9090c0", marginTop: 6, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.caption}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#6d5cff", marginTop: 6 }}>→ {item.cta}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                        {item.hashtags.slice(0, 4).map(tag => (
                          <span key={tag} style={{ borderRadius: 99, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", padding: "2px 8px", fontSize: 10, color: "#9090c0" }}>{tag}</span>
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