"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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

const inputClass = "ai-input mw-input";
const labelClass = "label mw-label";

export function MarketingWorkspace({ workspace, canEdit }: Props) {
  const [activeTab, setActiveTab] = useState<"brand" | "plan">("brand");
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
  const [startDate, setStartDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [imageSize, setImageSize] = useState<"1024x1024" | "1536x1024" | "1024x1536">("1024x1024");
  const [items, setItems] = useState<MarketingItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = tomorrow();
    setStartDate(t);
    setMinDate(t);
  }, []);

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
    const cleanPrimary = /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : "#111827";
    const cleanSecondary = /^#[0-9A-Fa-f]{6}$/.test(secondary) ? secondary : "#f59e0b";
    startTransition(async () => {
      try {
        const result = await updateBrandSettings(workspace.id, { brandName, description, primaryColor: cleanPrimary, secondaryColor: cleanSecondary, voice });
        if (!result.ok) setError(result.error ?? "Save failed.");
        else setMessage("✅ Brand saved successfully!");
      } catch (e) {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  function generatePlan() {
    setError(""); setMessage(""); setItems([]); setProgress(0);
    startTransition(async () => {
      const result = await generateMarketingPlan({ businessName: brandName, description, audience, platform, tone, goal, startDate: startDate || tomorrow(), duration, postsPerDay, brandVoice: voice });
      if (!result.ok && !result.items?.length) { setError(result.error); return; }
      if (result.error) setError(result.error);
      setItems(result.items.map((item) => ({ ...item, status: "pending", imageUrl: null })));
      setMessage(`Plan ready — ${result.items.length} content pieces generated!`);
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
        if (!result.ok || !result.image) throw new Error(result.error || "Image generation failed.");
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

  const canGenerate = brandName.trim() && description.trim() && audience.trim();

  return (
    <div className="mw-page">
      <style>{`
        .mw-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 32px 36px 90px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }
        .mw-stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(109,92,255,0.08);
          border: 1px solid rgba(109,92,255,0.2);
          border-radius: 16px;
          padding: 16px 24px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .mw-stats-label { display: flex; align-items: center; gap: 8px; color: #a89dff; font-size: 13px; font-weight: 600; white-space: nowrap; }
        .mw-stats-value { font-size: 20px; font-weight: 800; color: #f0f0ff; white-space: nowrap; }
        .mw-stats-value span { font-size: 12.5px; font-weight: 400; color: #9090c0; }
        .mw-grid {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 20px;
          align-items: start;
          width: 100%;
        }
        .mw-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        .mw-tabs {
          display: flex;
          gap: 4px;
          padding: 6px;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid var(--border);
        }
        .mw-tab {
          flex: 1;
          text-align: center;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary, #9090c0);
          cursor: pointer;
          transition: all 0.15s;
          border: none;
          background: transparent;
        }
        .mw-tab.active {
          background: rgba(109,92,255,0.18);
          color: #b0a0ff;
        }
        .mw-tab-body { padding: 26px; }
        .mw-tab-intro { font-size: 12.5px; color: #6d6d95; line-height: 1.6; margin-bottom: 22px; }
        .mw-fields { display: flex; flex-direction: column; gap: 20px; }
        .mw-field { display: flex; flex-direction: column; }
        .mw-label { margin-bottom: 9px !important; font-size: 10.5px !important; letter-spacing: 0.08em !important; }
        .mw-input { padding: 12px 14px !important; font-size: 13.5px !important; }
        .mw-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .mw-content-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
        .mw-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 12px; }
        @media (max-width: 1100px) {
          .mw-page { padding: 22px 20px 90px; }
          .mw-grid { grid-template-columns: 330px minmax(0, 1fr); gap: 16px; }
        }
        @media (max-width: 767px) {
          .mw-page { padding: 16px 14px 100px; gap: 14px; }
          .mw-grid { grid-template-columns: 1fr; gap: 14px; }
          .mw-tab-body { padding: 20px; }
          .mw-fields { gap: 16px; }
          .mw-row-2 { grid-template-columns: 1fr; gap: 12px; }
          .mw-stats-bar { padding: 14px 16px; }
          .mw-stats-value { font-size: 17px; }
          .mw-content-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
        }
      `}</style>

      <div className="mw-stats-bar">
        <div className="mw-stats-label"><WandSparkles size={15} /> Planned output</div>
        <div className="mw-stats-value">{total} <span>posts · {duration} days · {postsPerDay}/day</span></div>
      </div>

      {(message || error) && (
        <div style={{ borderRadius: 12, padding: "14px 18px", fontSize: 13, fontWeight: 500, border: error ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(109,92,255,0.3)", background: error ? "rgba(239,68,68,0.08)" : "rgba(109,92,255,0.08)", color: error ? "#f87171" : "#a89dff" }}>
          {error || message}
        </div>
      )}

      <div className="mw-grid">
        <div className="mw-card">
          <div className="mw-tabs">
            <button className={`mw-tab ${activeTab === "brand" ? "active" : ""}`} onClick={() => setActiveTab("brand")}>
              <Palette size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Brand
            </button>
            <button className={`mw-tab ${activeTab === "plan" ? "active" : ""}`} onClick={() => setActiveTab("plan")}>
              <CalendarDays size={13} style={{ marginRight: 6, verticalAlign: -2 }} />Content plan
            </button>
          </div>

          {activeTab === "brand" ? (
            <div className="mw-tab-body">
              <p className="mw-tab-intro">Set this up once — it's reused every time you generate a content plan.</p>
              <div className="mw-fields">
                <div className="mw-field">
                  <div className={labelClass}>Brand name</div>
                  <input disabled={!canEdit} value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Your business name" className={inputClass} />
                </div>
                <div className="mw-field">
                  <div className={labelClass}>What do you sell?</div>
                  <textarea disabled={!canEdit} value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Specialty coffee, pastries and cozy cafe experiences." className={inputClass} style={{ resize: "vertical" }} />
                </div>
                <div className="mw-field">
                  <div className={labelClass}>Brand voice</div>
                  <input disabled={!canEdit} value={voice} onChange={e => setVoice(e.target.value)} placeholder="Warm, witty, premium…" className={inputClass} />
                </div>
                <div className="mw-row-2">
                  <div className="mw-field">
                    <div className={labelClass}>Primary color</div>
                    <input disabled={!canEdit} type="color" value={primary} onChange={e => setPrimary(e.target.value)} style={{ width: "100%", height: 46, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: primary, padding: 4, cursor: "pointer" }} />
                  </div>
                  <div className="mw-field">
                    <div className={labelClass}>Accent color</div>
                    <input disabled={!canEdit} type="color" value={secondary} onChange={e => setSecondary(e.target.value)} style={{ width: "100%", height: 46, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: secondary, padding: 4, cursor: "pointer" }} />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, border: "1px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)", padding: "13px 16px", fontSize: 13, fontWeight: 500, color: "#9090c0", cursor: "pointer" }}>
                  <Upload size={14} />
                  {logoUrl ? "Replace logo" : "Upload logo"}
                  <input disabled={!canEdit} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" style={{ display: "none" }} onChange={e => void handleLogo(e.target.files?.[0])} />
                </label>
                {logoUrl && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, border: "1px solid rgba(109,92,255,0.2)", background: "rgba(109,92,255,0.05)", padding: 13 }}>
                    <img src={logoUrl} alt="Brand logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }} />
                    <span style={{ fontSize: 12, color: "#9090c0" }}>Added to every generated image.</span>
                  </div>
                )}
                {canEdit && (
                  <button onClick={saveBrand} disabled={isPending} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#f0f0ff", cursor: "pointer", opacity: isPending ? 0.5 : 1, marginTop: 4 }}>
                    {isPending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                    Save brand
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mw-tab-body">
              <p className="mw-tab-intro">Tell us who you're talking to and how you want to show up — we'll build the full calendar from this.</p>
              <div className="mw-fields">
                <div className="mw-field">
                  <div className={labelClass}>Target audience</div>
                  <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Coffee lovers, students, young professionals" className={inputClass} />
                </div>
                <div className="mw-row-2">
                  <div className="mw-field">
                    <div className={labelClass}>Platform</div>
                    <select value={platform} onChange={e => setPlatform(e.target.value as AIPlatform)} className={inputClass}>
                      {platforms.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="mw-field">
                    <div className={labelClass}>Posts / day</div>
                    <select value={postsPerDay} onChange={e => setPostsPerDay(Number(e.target.value))} className={inputClass}>
                      {[1, 2, 3].map(n => <option key={n} value={n}>{n} post{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mw-row-2">
                  <div className="mw-field">
                    <div className={labelClass}>Days</div>
                    <select value={duration} onChange={e => setDuration(Number(e.target.value))} className={inputClass}>
                      {Array.from({ length: 30 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} days</option>)}
                    </select>
                  </div>
                  <div className="mw-field">
                    <div className={labelClass}>Start date</div>
                    <input type="date" min={minDate} value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="mw-row-2">
                  <div className="mw-field">
                    <div className={labelClass}>Tone</div>
                    <select value={tone} onChange={e => setTone(e.target.value as AITone)} className={inputClass}>
                      {tones.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="mw-field">
                    <div className={labelClass}>Goal</div>
                    <select value={goal} onChange={e => setGoal(e.target.value as AIObjective)} className={inputClass}>
                      {goals.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mw-field">
                  <div className={labelClass}>Image format</div>
                  <select value={imageSize} onChange={e => setImageSize(e.target.value as typeof imageSize)} className={inputClass}>
                    <option value="1024x1024">Square — Instagram post</option>
                    <option value="1536x1024">Landscape</option>
                    <option value="1024x1536">Portrait</option>
                  </select>
                </div>
                <button onClick={generatePlan} disabled={isPending || !canGenerate}
                  title={!canGenerate ? "Fill in brand name, description and target audience first" : undefined}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)", padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer", border: "none", opacity: (isPending || !canGenerate) ? 0.5 : 1, boxShadow: "0 4px 20px rgba(109,92,255,0.25)", marginTop: 4 }}>
                  {isPending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={16} />}
                  Generate {total} content pieces
                </button>
                {!canGenerate && (
                  <p style={{ fontSize: 11.5, color: "#6d6d95", textAlign: "center", marginTop: -8 }}>
                    Fill in your brand name & description on the <b style={{ color: "#9090c0" }}>Brand</b> tab first.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          {!items.length ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500, borderRadius: 20, border: "1px dashed rgba(255,255,255,0.1)", background: "var(--bg-surface)", padding: 40, textAlign: "center", boxSizing: "border-box" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, rgba(109,92,255,0.2), rgba(168,85,247,0.2))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
                <Sparkles size={28} color="#a89dff" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f0f0ff", margin: 0 }}>Your content calendar will appear here</h3>
              <p style={{ fontSize: 13, color: "#50507a", marginTop: 12, lineHeight: 1.7, maxWidth: 420 }}>
                For a coffee business, the AI mixes product shots, education, customer moments, offers, behind-the-scenes and engagement posts. Your logo is composited after generation so it stays pixel-perfect.
              </p>
            </div>
          ) : (
            <div>
              <div className="mw-toolbar">
                <div>
                  <div style={{ fontWeight: 700, color: "#f0f0ff", fontSize: 15 }}>Content batch</div>
                  <div style={{ fontSize: 12, color: "#50507a", marginTop: 4 }}>{ready}/{items.length} images ready · {duration} days · {postsPerDay}/day</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => void generateImages()} disabled={isPending || items.some(i => i.status === "generating")}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#f0f0ff", cursor: "pointer", opacity: isPending ? 0.5 : 1 }}>
                    <ImageIcon size={14} />{ready ? "Regenerate" : "Generate images"}
                  </button>
                  <button onClick={scheduleBatch} disabled={isPending || ready !== items.length}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 10, background: "linear-gradient(135deg, #6d5cff, #a855f7)", padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", border: "none", opacity: (isPending || ready !== items.length) ? 0.4 : 1, boxShadow: "0 4px 16px rgba(109,92,255,0.25)" }}>
                    <CalendarDays size={14} />Add to calendar
                  </button>
                </div>
              </div>

              {progress > 0 && progress < 100 && (
                <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", marginBottom: 18, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #6d5cff, #a855f7)", width: `${progress}%`, transition: "width 0.3s" }} />
                </div>
              )}

              <div className="mw-content-grid">
                {items.map((item) => (
                  <article key={`${item.day}-${item.slot}`} style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "var(--bg-surface)", overflow: "hidden" }}>
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
                    <div style={{ padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6d5cff" }}>Day {item.day}{postsPerDay > 1 ? ` · ${item.slot}` : ""}</span>
                        <span style={{ fontSize: 10, color: "#50507a" }}>{new Date(`${item.suggestedDate}T12:00:00`).toLocaleDateString()}</span>
                      </div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#f0f0ff", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.hook}</h4>
                      <p style={{ fontSize: 11, color: "#9090c0", marginTop: 8, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.caption}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#6d5cff", marginTop: 8 }}>→ {item.cta}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12 }}>
                        {item.hashtags.slice(0, 4).map(tag => (
                          <span key={tag} style={{ borderRadius: 99, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", padding: "3px 9px", fontSize: 10, color: "#9090c0" }}>{tag}</span>
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
