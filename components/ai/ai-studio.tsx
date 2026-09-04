"use client";

import { useState, useTransition } from "react";
import { Check, Clipboard, Loader2, RefreshCw, Save, Send, Sparkles } from "lucide-react";
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
  return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>{children}{error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}</div>;
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Sparkles size={19} /></span><div><h2 className="font-semibold text-slate-950">Content brief</h2><p className="text-xs text-slate-500">Tell the studio what you want to create.</p></div></div>
        <div className="mt-6 space-y-5">
          <Field label="Topic / Product" error={errors.topic}><textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="New summer coffee collection" rows={3} maxLength={300} className={inputClass} /></Field>
          <Field label="Target Audience" error={errors.targetAudience}><input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Young professionals" maxLength={300} className={inputClass} /></Field>
          <Field label="Platform" error={errors.platform}><select value={platform} onChange={(e) => setPlatform(e.target.value as AIPlatform)} className={inputClass}>{platforms.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
          <Field label="Tone" error={errors.tone}><select value={tone} onChange={(e) => setTone(e.target.value as AITone)} className={inputClass}>{tones.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
          <Field label="Objective" error={errors.objective}><select value={objective} onChange={(e) => setObjective(e.target.value as AIObjective)} className={inputClass}>{objectives.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
          <Field label="Category"><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
          <button type="button" onClick={generate} disabled={isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50">{isPending ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}{content ? "Regenerate Content" : "Generate Content"}</button>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">AI output</p><h2 className="mt-1 text-lg font-bold text-slate-950">Content studio</h2></div>{content && <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${provider === "mock" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{provider === "mock" ? "Demo Mode" : `Real API · ${provider}`}</span>}</div>
        {notice && <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"><Check size={16} />{notice}</div>}
        {!content ? <div className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Sparkles size={24} /></div><h3 className="mt-4 text-base font-semibold text-slate-900">Your generated content will appear here</h3><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Build a brief on the left, then generate a structured hook, caption, CTA, hashtags, and image prompt.</p></div> : <div className="mt-5 space-y-4">
          <OutputField label="Hook" value={content.hook} onChange={(value) => updateField("hook", value)} onCopy={() => copyText(content.hook, "Hook")} />
          <OutputField label="Caption" value={content.caption} textarea onChange={(value) => updateField("caption", value)} onCopy={() => copyText(content.caption, "Caption")} />
          <OutputField label="CTA" value={content.cta} onChange={(value) => updateField("cta", value)} onCopy={() => copyText(content.cta, "CTA")} />
          <OutputField label="Hashtags" value={content.hashtags.join(" ")} textarea onChange={(value) => updateField("hashtags", value)} onCopy={() => copyText(content.hashtags.join(" "), "Hashtags")} />
          <OutputField label="Image Prompt" value={content.imagePrompt} textarea onChange={(value) => updateField("imagePrompt", value)} onCopy={() => copyText(content.imagePrompt, "Image prompt")} />
          
          {content.imagePrompt && (
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-violet-600">AI Image + Video Studio</p>
                  <p className="text-xs text-violet-500">Generate an image or video from this prompt</p>
                </div>
              </div>
              <a href={"/image-studio?prompt=" + encodeURIComponent(content.imagePrompt)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
                Open Image and Video Studio with this prompt
              </a>
            </div>
          )}

          <Field label="Schedule Date & Time"><input type="datetime-local" value={scheduledAt} min={minDateTime} onChange={(e) => setScheduledAt(e.target.value)} className={inputClass} /></Field>
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap"><button type="button" onClick={() => copyText([content.hook, content.caption, content.cta, content.hashtags.join(" ")].join("\n\n"), "Content")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Clipboard size={16} /> Copy All</button><button type="button" onClick={generate} disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={16} /> Regenerate</button><button type="button" onClick={() => save("DRAFT")} disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"><Save size={16} /> Save Draft</button><button type="button" onClick={() => save("SCHEDULED")} disabled={isPending || !scheduledAt} title={!scheduledAt ? "Choose a future date and time first." : undefined} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><Send size={16} /> Schedule</button></div>
        </div>}
      </section>
    </div>
  </div>;
}

function OutputField({ label, value, onChange, onCopy, textarea = false }: { label: string; value: string; onChange: (value: string) => void; onCopy: () => void; textarea?: boolean }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"><div className="mb-2 flex items-center justify-between gap-3"><label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label><button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"><Clipboard size={13} /> Copy</button></div>{textarea ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={label === "Caption" ? 8 : 4} className="w-full resize-y bg-transparent text-sm leading-6 text-slate-800 outline-none" /> : <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm leading-6 text-slate-800 outline-none" />}</div>;
}
