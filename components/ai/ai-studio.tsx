"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  Clipboard,
  Loader2,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  SlidersHorizontal,
  CalendarDays,
  FileText,
  Share2,
} from "lucide-react";
import { generateAIContent } from "@/lib/ai/actions";
import { createPost } from "@/lib/content/actions";
import type { Category } from "@/types/database";
import type { AIObjective, AIPlatform, AITone, GeneratedContent } from "@/ai/types";

const platforms: Array<{ value: AIPlatform; label: string }> = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "X", label: "X (Twitter)" },
];

const tones: Array<{ value: AITone; label: string }> = [
  { value: "FRIENDLY", label: "Friendly" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "EDUCATIONAL", label: "Educational" },
  { value: "INSPIRATIONAL", label: "Inspirational" },
  { value: "FUNNY", label: "Funny" },
  { value: "LUXURY", label: "Luxury" },
  { value: "CASUAL", label: "Casual" },
];

const objectives: Array<{ value: AIObjective; label: string }> = [
  { value: "ENGAGEMENT", label: "Engagement" },
  { value: "SALES", label: "Sales & Conversions" },
  { value: "AWARENESS", label: "Brand Awareness" },
  { value: "TRAFFIC", label: "Website Traffic" },
  { value: "LEADS", label: "Lead Generation" },
  { value: "BRAND_BUILDING", label: "Brand Building" },
];

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPending, startTransition] = useTransition();

  function generate() {
    if (!topic.trim()) {
      setErrors({ topic: "Please describe what you want to post about." });
      return;
    }
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
          ? "Generated in Demo Mode. Add an AI key in settings to use a live provider."
          : `Generated with ${result.provider}.`
      );
    });
  }

  function updateField(field: keyof GeneratedContent, value: string) {
    setContent((current) =>
      current
        ? {
            ...current,
            [field]:
              field === "hashtags"
                ? value
                    .split(/[,\n ]/)
                    .map((item) => item.trim())
                    .filter(Boolean)
                : value,
          }
        : current
    );
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard!`);
    } catch {
      setNotice("Clipboard access unavailable.");
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
        setNotice(status === "SCHEDULED" ? "Post scheduled successfully!" : "Post saved as draft!");
      } catch (error) {
        if (error instanceof Error && error.message) setNotice(error.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-xs text-violet-300">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-violet-400" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-white/40 hover:text-white transition"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)] items-start">
        {/* LEFT COLUMN: Prompt & Settings Form */}
        <div className="campaign-brief-panel" style={{ gap: 20 }}>
          {/* Card Header */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-white/[0.06]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0">
              <Sparkles size={19} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Content Prompt</h2>
              <p className="text-xs text-white/50 mt-0.5">Describe your idea and choose your platform.</p>
            </div>
          </div>

          {/* Primary Prompt Input */}
          <div>
            <div className="campaign-field-label">
              <span>What do you want to create? *</span>
              <span className="text-[11px] text-white/40 font-normal normal-case">Be descriptive</span>
            </div>
            <textarea
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (errors.topic) setErrors({});
              }}
              placeholder="e.g. 5 game-changing productivity habits for agency founders, including morning rituals and time-blocking..."
              rows={4}
              maxLength={400}
              className="campaign-input resize-y"
              style={{ minHeight: 110, lineHeight: 1.6 }}
            />
            {errors.topic && <p className="mt-1.5 text-xs font-medium text-red-400">{errors.topic}</p>}
          </div>

          {/* Platform Selector Chips */}
          <div>
            <div className="campaign-field-label">
              <span>Target Platform</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlatform(p.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-semibold transition ${
                    platform === p.value
                      ? "border-violet-500 bg-violet-600/20 text-white shadow-sm"
                      : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={generate}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Crafting with AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{content ? "Regenerate Content" : "Generate Content"}</span>
              </>
            )}
          </button>

          {/* Collapsible Advanced Options */}
          <div className="border-t border-white/[0.06] pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-between py-1 text-xs font-semibold text-white/60 hover:text-white transition"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-violet-400" />
                <span>Advanced Options (Audience, Tone, Goal)</span>
              </div>
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 pt-2">
                {/* Target Audience */}
                <div>
                  <div className="campaign-field-label">
                    <span>Target Audience</span>
                  </div>
                  <input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Freelancers, agency owners (25-45)"
                    maxLength={300}
                    className="campaign-input"
                  />
                </div>

                {/* Tone of Voice */}
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
                    {tones.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campaign Objective */}
                <div>
                  <div className="campaign-field-label">
                    <span>Primary Objective</span>
                  </div>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value as AIObjective)}
                    className="campaign-input"
                    style={{ height: 40 }}
                  >
                    {objectives.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <div className="campaign-field-label">
                    <span>Category</span>
                  </div>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="campaign-input"
                    style={{ height: 40 }}
                  >
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Output Canvas Area */}
        <div className="space-y-5 min-w-0">
          {!content ? (
            /* Empty State */
            <div className="campaign-stage-panel flex flex-col items-center justify-center text-center p-12 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Sparkles size={28} />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-white">Ready to create your post</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Enter your topic on the left and choose your target platform. ContentAI will synthesize a high-converting hook, caption, call to action, and hashtags.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {[
                  "5 productivity hacks",
                  "Behind the scenes of our launch",
                  "Why most creators fail at consistency",
                ].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 hover:text-white hover:border-violet-500/30 transition"
                  >
                    💡 {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Generated Content Cards */
            <div className="space-y-4">
              {/* Studio Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0c0c16]/90 p-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      provider === "mock" ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                  <span className="text-xs font-semibold text-white">
                    Generated for {platform} · {provider === "mock" ? "Demo Provider" : provider}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyText(`${content.hook}\n\n${content.caption}\n\n${content.cta}\n\n${content.hashtags.join(" ")}`, "Full post")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <Clipboard size={12} />
                    <span>Copy All</span>
                  </button>
                  <button
                    type="button"
                    onClick={generate}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <RefreshCw size={12} />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Card 1: Hook Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-5 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                    Hook / Attention Grabber
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(content.hook, "Hook")}
                    className="text-white/40 hover:text-white transition"
                    title="Copy hook"
                  >
                    <Clipboard size={14} />
                  </button>
                </div>
                <input
                  value={content.hook}
                  onChange={(e) => updateField("hook", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-violet-500"
                />
              </div>

              {/* Card 2: Main Caption Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-5 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                    Post Caption / Story
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(content.caption, "Caption")}
                    className="text-white/40 hover:text-white transition"
                    title="Copy caption"
                  >
                    <Clipboard size={14} />
                  </button>
                </div>
                <textarea
                  value={content.caption}
                  onChange={(e) => updateField("caption", e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-[#16162a] p-3.5 text-xs sm:text-sm text-white outline-none leading-relaxed focus:border-violet-500 resize-y"
                />
              </div>

              {/* Card 3: 2-Column Row for CTA & Hashtags */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* CTA */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-4 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                      Call to Action (CTA)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(content.cta, "CTA")}
                      className="text-white/40 hover:text-white transition"
                    >
                      <Clipboard size={14} />
                    </button>
                  </div>
                  <input
                    value={content.cta}
                    onChange={(e) => updateField("cta", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
                  />
                </div>

                {/* Hashtags */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-4 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                      Hashtags
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(content.hashtags.join(" "), "Hashtags")}
                      className="text-white/40 hover:text-white transition"
                    >
                      <Clipboard size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {content.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[11px] font-medium text-violet-300"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 4: Visual Direction & Image Studio Link */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-violet-400" />
                    <span className="text-xs font-bold text-white">Visual Art Direction</span>
                  </div>
                  <Link
                    href={`/image-studio?prompt=${encodeURIComponent(content.imagePrompt)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
                  >
                    <span>Generate in Image Studio</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
                <p className="text-xs text-white/70 italic bg-[#16162a] p-3 rounded-xl border border-white/10">
                  &ldquo;{content.imagePrompt}&rdquo;
                </p>
              </div>

              {/* Card 5: Publishing & Scheduling Actions */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c16]/95 p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays size={16} className="text-violet-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Ready to Publish or Schedule?</div>
                      <div className="text-[11px] text-white/50">Save directly to your workspace posts</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="rounded-xl border border-white/10 bg-[#16162a] px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => save("DRAFT")}
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => save("SCHEDULED")}
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-50"
                  >
                    <CalendarDays size={14} />
                    <span>Schedule Post</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
