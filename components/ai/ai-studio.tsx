"use client";

import { useState, useTransition } from "react";
import { Check, Clipboard, Loader2, RefreshCw, Save, Send, Sparkles, ImageIcon } from "lucide-react";
import { generateAIContent } from "@/lib/ai/actions";
import { createPost } from "@/lib/content/actions";
import type { Category } from "@/types/database";
import type { AIObjective, AIPlatform, AITone, GeneratedContent } from "@/ai/types";

const platforms: Array<{ value: AIPlatform; label: string }> = [
  { value: "INSTAGRAM", label: "Instagram" }, { value: "FACEBOOK", label: "Facebook" }, { value: "LINKEDIN", label: "LinkedIn" }, { value: "X", label: "X" },
];
const tones: Array<{ value: AITone; label: string }> = [
  { value: "PROFESSIONAL", label: "Professional" }, { value: "FRIENDLY", label: "Friendly" }, { value: "FUNNY", label: "Funny" }, { value: "INSPIRATIONAL", label: "Inspirational" }, { value: "EDUCATIONAL", label: "Educational" }, { value: "LUXURY", label: "Luxury" }, { value: "CASUAL", label: "Casual" },
];
const objectives: Array<{ value: AIObjective; label: string }> = [
  { value: "ENGAGEMENT", label: "Engagement" }, { value: "SALES", label: "Sales" }, { value: "AWARENESS", label: "Awareness" }, { value: "TRAFFIC", label: "Traffic" }, { value: "LEADS", label: "Leads" }, { value: "BRAND_BUILDING", label: "Brand Building" },
];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ marginBottom: 8, display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>{label}</label>
      {children}
      {error && <p style={{ marginTop: 4, fontSize: 11.5, fontWeight: 500, color: "var(--red)" }}>{error}</p>}
    </div>
  );
}

const inputClass = "ai-input";

export function AIStudio({ categories }: { categories: Category[] }) {
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platform, setPlatform] = useState<AIPlatform>("INSTAGRAM");
  const [tone, setTone] = useState<AITone>("FRIENDLY");
  const [objective, setObjective] = useState<AIObjective>("ENGAGEMENT");
  const [categoryId, setCategoryId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [provider, setProvider] = useState<string>("mock");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();
  const [minDateTime] = useState(() => new Date(Date.now() + 60000).toISOString().slice(0, 16));

  function generate() {
    setNotice("");
    startTransition(async () => {
      const result = await generateAIContent({ topic, targetAudience, platform, tone, objective });
      if (!result.ok) { setErrors(result.errors); return; }
      setErrors({}); setContent(result.content); setProvider(result.provider);
      setNotice(result.provider === "mock" ? "Generated in Demo Mode. Add an AI key to use a real provider." : `Generated with ${result.provider}.`);
    });
  }

  function updateField(field: keyof GeneratedContent, value: string) {
    setContent((current) => current ? { ...current, [field]: field === "hashtags" ? value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean) : value } : current);
  }

  async function copyText(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setNotice(`${label} copied to clipboard.`); } catch { setNotice("Clipboard access is unavailable in this browser."); }
  }

  function save(status: "DRAFT" | "SCHEDULED") {
    if (!content) return;
    const form = new FormData();
    form.set("title", topic.slice(0, 200) || "AI Generated Post");
    form.set("caption", `${content.hook}\n\n${content.caption}`);
    form.set("platform", platform);
    form.set("status", status);
    form.set("category_id", categoryId);
    form.set("cta", content.cta);
    form.set("hashtags", content.hashtags.join(" "));
    form.set("image_prompt", content.imagePrompt);
    if (scheduledAt) form.set("scheduled_at", scheduledAt);
    startTransition(async () => {
      try {
        await createPost(form);
      } catch (error) {
        if (error instanceof Error && error.message) setNotice(error.message);
      }
    });
  }

  return <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: "var(--r-lg)", background: "var(--accent-soft)", color: "var(--accent)" }}><Sparkles size={19} /></span>
          <div>
            <h2 style={{ fontWeight: 600, color: "var(--text-primary)" }}>Content brief</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Tell the studio what you want to create.</p>
          </div>
        </div>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Topic / Product" error={errors.topic}><textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="New summer coffee collection" rows={3} maxLength={300} className={inputClass} /></Field>
          <Field label="Target Audience" error={errors.targetAudience}><input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Young professionals" maxLength={300} className={inputClass} /></Field>
          <Field label="Platform" error={errors.platform}><select value={platform} onChange={(e) => setPlatform(e.target.value as AIPlatform)} className={inputClass}>{platforms.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
          <Field label="Tone" error={errors.tone}><select value={tone} onChange={(e) => setTone(e.target.value as AITone)} className={inputClass}>{tones.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
          <Field label="Objective" error={errors.objective}><select value={objective} onChange={(e) => setObjective(e.target.value as AIObjective)} className={inputClass}>{objectives.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
          <Field label="Category"><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
          <button type="button" onClick={generate} disabled={isPending} className="btn btn-ai" style={{ width: "100%", padding: "12px 16px", fontSize: 13.5 }}>{isPending ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}{content ? "Regenerate Content" : "Generate Content"}</button>
        </div>
      </section>

      <section className="card" style={{ minWidth: 0, padding: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, borderBottom: "1px solid var(--border)", paddingBottom: 20 }} className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--accent)" }}>AI output</p>
            <h2 style={{ marginTop: 4, fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>Content studio</h2>
          </div>
          {content && (
            <span style={{
              display: "inline-flex", width: "fit-content", alignItems: "center", gap: 6,
              borderRadius: 999, padding: "5px 10px", fontSize: 11.5, fontWeight: 600,
              background: provider === "mock" ? "var(--amber-soft)" : "var(--green-soft)",
              color: provider === "mock" ? "var(--amber)" : "var(--green)",
            }}>
              <span style={{ height: 6, width: 6, borderRadius: "50%", background: "currentColor" }} />
              {provider === "mock" ? "Demo Mode" : `Real API · ${provider}`}
            </span>
          )}
        </div>
        {notice && (
          <div role="status" style={{
            marginTop: 16, display: "flex", alignItems: "center", gap: 8, borderRadius: "var(--r-md)",
            border: "1px solid var(--border-accent)", background: "var(--accent-soft)", padding: "10px 14px",
            fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)",
          }}>
            <Check size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />{notice}
          </div>
        )}
        {!content ? (
          <div style={{ display: "flex", minHeight: 480, flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
            <div style={{ display: "flex", height: 56, width: 56, alignItems: "center", justifyContent: "center", borderRadius: "var(--r-xl)", background: "var(--bg-elevated)", color: "var(--text-muted)" }}><Sparkles size={24} /></div>
            <h3 style={{ marginTop: 16, fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Your generated content will appear here</h3>
            <p style={{ marginTop: 8, maxWidth: 420, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-muted)" }}>Build a brief on the left, then generate a structured hook, caption, CTA, hashtags, and image prompt.</p>
          </div>
        ) : (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <OutputField label="Hook" value={content.hook} onChange={(value) => updateField("hook", value)} onCopy={() => copyText(content.hook, "Hook")} />
            <OutputField label="Caption" value={content.caption} textarea onChange={(value) => updateField("caption", value)} onCopy={() => copyText(content.caption, "Caption")} />
            <OutputField label="CTA" value={content.cta} onChange={(value) => updateField("cta", value)} onCopy={() => copyText(content.cta, "CTA")} />
            <OutputField label="Hashtags" value={content.hashtags.join(" ")} textarea onChange={(value) => updateField("hashtags", value)} onCopy={() => copyText(content.hashtags.join(" "), "Hashtags")} />
            <OutputField label="Image Prompt" value={content.imagePrompt} textarea onChange={(value) => updateField("imagePrompt", value)} onCopy={() => copyText(content.imagePrompt, "Image prompt")} />

            {content.imagePrompt && (
              <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--border-accent)", background: "var(--purple-soft)", padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ display: "flex", height: 32, width: 32, alignItems: "center", justifyContent: "center", borderRadius: "var(--r-md)", background: "var(--accent-soft)", color: "var(--purple)" }}>
                    <ImageIcon size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--purple)" }}>AI Image + Video Studio</p>
                    <p style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Generate an image or video from this prompt</p>
                  </div>
                </div>
                <a href={"/image-studio?prompt=" + encodeURIComponent(content.imagePrompt)} className="btn btn-ai" style={{ width: "100%", padding: "10px 16px" }}>
                  Open Image and Video Studio with this prompt
                </a>
              </div>
            )}

            <Field label="Schedule Date & Time"><input type="datetime-local" value={scheduledAt} min={minDateTime} onChange={(e) => setScheduledAt(e.target.value)} className={inputClass} /></Field>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <button type="button" onClick={() => copyText([content.hook, content.caption, content.cta, content.hashtags.join(" ")].join("\n\n"), "Content")} className="btn btn-primary"><Clipboard size={15} /> Copy All</button>
              <button type="button" onClick={generate} disabled={isPending} className="btn btn-primary"><RefreshCw size={15} /> Regenerate</button>
              <button type="button" onClick={() => save("DRAFT")} disabled={isPending} className="btn btn-primary"><Save size={15} /> Save Draft</button>
              <button type="button" onClick={() => save("SCHEDULED")} disabled={isPending || !scheduledAt} title={!scheduledAt ? "Choose a future date and time first." : undefined} className="btn btn-ai" style={{ opacity: !scheduledAt ? 0.5 : 1 }}><Send size={15} /> Schedule</button>
            </div>
          </div>
        )}
      </section>
    </div>
  </div>;
}

function OutputField({ label, value, onChange, onCopy, textarea = false }: { label: string; value: string; onChange: (value: string) => void; onCopy: () => void; textarea?: boolean }) {
  return (
    <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--border)", background: "var(--bg-elevated)", padding: 16 }}>
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>{label}</label>
        <button type="button" onClick={onCopy} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}><Clipboard size={13} /> Copy</button>
      </div>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={label === "Caption" ? 8 : 4} style={{ width: "100%", resize: "vertical", background: "transparent", fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)", outline: "none", border: "none", fontFamily: "inherit" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", background: "transparent", fontSize: 13, lineHeight: 1.6, color: "var(--text-primary)", outline: "none", border: "none", fontFamily: "inherit" }} />
      )}
    </div>
  );
}
