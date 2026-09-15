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

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#121222] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";
const selectClass =
  "h-10 w-full rounded-xl border border-white/10 bg-[#121222] px-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-red-400">{error}</p>}
    </div>
  );
}

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
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setErrors({});
      setContent(result.content);
      setProvider(result.provider);
      setNotice(
        result.provider === "mock"
          ? "Generated in Demo Mode. Add an AI key to use a real provider."
          : `Generated with ${result.provider}.`
      );
    });
  }

  function updateField(field: keyof GeneratedContent, value: string) {
    setContent((current) =>
      current
        ? {
            ...current,
            [field]: field === "hashtags" ? value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean) : value,
          }
        : current
    );
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard.`);
    } catch {
      setNotice("Clipboard access is unavailable in this browser.");
    }
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

  return (
    <div className="space-y-6">
      <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left: Input Brief Card */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4 mb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white">Content Brief</h2>
              <p className="text-xs text-white/50">Define the theme, audience, and voice.</p>
            </div>
          </div>

          <div className="space-y-5">
            <Field label="Topic / Concept" error={errors.topic}>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 5 productivity habits every remote founder needs"
                rows={3}
                maxLength={300}
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </Field>

            <Field label="Target Audience" error={errors.targetAudience}>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Startup founders, remote engineers"
                maxLength={300}
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Platform" error={errors.platform}>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as AIPlatform)}
                  className={selectClass}
                >
                  {platforms.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tone" error={errors.tone}>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as AITone)}
                  className={selectClass}
                >
                  {tones.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Objective" error={errors.objective}>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as AIObjective)}
                  className={selectClass}
                >
                  {objectives.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Category">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={isPending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition disabled:opacity-50"
            >
              {isPending ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
              {content ? "Regenerate Content" : "Generate Content"}
            </button>
          </div>
        </section>

        {/* Right: Output Studio Stage */}
        <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
          <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-400">
                ✦ Studio Canvas
              </div>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-white">Generated Content Bundle</h2>
            </div>
            {content && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  provider === "mock"
                    ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                    : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {provider === "mock" ? "Demo Mode" : `Real API · ${provider}`}
              </span>
            )}
          </div>

          {notice && (
            <div
              role="status"
              className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-300"
            >
              <Check size={16} className="text-emerald-400 shrink-0" />
              {notice}
            </div>
          )}

          {errors.form && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-400"
            >
              {errors.form}
            </div>
          )}

          {!content ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] text-white/30">
                <Sparkles size={24} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">Your generated copy will appear here</h3>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-white/40">
                Provide a prompt on the left and click Generate to produce hooks, captions, calls-to-action, hashtags, and visual prompts.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <OutputField
                label="Hook"
                value={content.hook}
                onChange={(value) => updateField("hook", value)}
                onCopy={() => copyText(content.hook, "Hook")}
              />
              <OutputField
                label="Caption"
                value={content.caption}
                textarea
                onChange={(value) => updateField("caption", value)}
                onCopy={() => copyText(content.caption, "Caption")}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <OutputField
                  label="CTA"
                  value={content.cta}
                  onChange={(value) => updateField("cta", value)}
                  onCopy={() => copyText(content.cta, "CTA")}
                />
                <OutputField
                  label="Hashtags"
                  value={content.hashtags.join(" ")}
                  onChange={(value) => updateField("hashtags", value)}
                  onCopy={() => copyText(content.hashtags.join(" "), "Hashtags")}
                />
              </div>
              <OutputField
                label="Visual Image Prompt"
                value={content.imagePrompt}
                textarea
                onChange={(value) => updateField("imagePrompt", value)}
                onCopy={() => copyText(content.imagePrompt, "Image prompt")}
              />

              {content.imagePrompt && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                      <ImageIcon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-violet-300">AI Image Studio</p>
                      <p className="text-[11px] text-white/50">Turn this prompt into high-resolution visuals</p>
                    </div>
                  </div>
                  <a
                    href={"/image-studio?prompt=" + encodeURIComponent(content.imagePrompt)}
                    className="inline-flex h-9 w-full items-center justify-center rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-500"
                  >
                    Open Image Studio with this prompt &rarr;
                  </a>
                </div>
              )}

              <Field label="Schedule Date & Time">
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  min={minDateTime}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        [content.hook, content.caption, content.cta, content.hashtags.join(" ")].join("\n\n"),
                        "Content"
                      )
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <Clipboard size={14} /> Copy All
                  </button>
                  <button
                    type="button"
                    onClick={generate}
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => save("DRAFT")}
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <Save size={14} /> Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => save("SCHEDULED")}
                    disabled={isPending || !scheduledAt}
                    title={!scheduledAt ? "Choose a future date and time first." : undefined}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition disabled:opacity-50"
                  >
                    <Send size={14} /> Schedule
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function OutputField({
  label,
  value,
  onChange,
  onCopy,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
  textarea?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#121222]/80 p-4 transition focus-within:border-violet-500/50">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{label}</label>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition"
        >
          <Clipboard size={12} /> Copy
        </button>
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={label === "Caption" ? 7 : 3}
          className="w-full resize-y bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/30"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      )}
    </div>
  );
}
