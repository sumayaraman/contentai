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
        <div className="flex items-center justify-between rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3.5 text-xs sm:text-sm text-violet-200 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-violet-400 shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-white/40 hover:text-white transition p-1"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Prompt & Settings Form */}
        <div className="lg:col-span-5 xl:col-span-5 rounded-2xl border border-white/[0.08] bg-[#0c0c16]/95 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
          {/* Card Header */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-white/[0.06]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0 shadow-sm">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Content Prompt</h2>
              <p className="text-xs text-white/50 mt-0.5">Describe your idea and choose your platform.</p>
            </div>
          </div>

          {/* Primary Prompt Input */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                What do you want to create? <span className="text-violet-400">*</span>
              </label>
              <span className="text-[11px] text-white/40">Be descriptive</span>
            </div>
            <textarea
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (errors.topic) setErrors({});
              }}
              placeholder="e.g. 5 game-changing productivity habits for agency founders, including morning rituals and time-blocking..."
              rows={5}
              maxLength={500}
              className="w-full rounded-xl border border-white/10 bg-[#16162a]/80 p-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-violet-500 focus:bg-[#1a1a32] focus:ring-2 focus:ring-violet-500/20 resize-y"
              style={{ minHeight: 125, lineHeight: 1.6 }}
            />
            {errors.topic && <p className="text-xs font-medium text-red-400">{errors.topic}</p>}
          </div>

          {/* Platform Selector Chips */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-white/70">
              Target Platform
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {platforms.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlatform(p.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-3 px-3.5 text-xs font-semibold transition-all cursor-pointer ${
                    platform === p.value
                      ? "border-violet-500 bg-violet-600/25 text-white shadow-md shadow-violet-600/20"
                      : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced / Strategy Options (Always Visible) */}
          <div className="border-t border-white/[0.08] pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                Advanced Strategy Options
              </span>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70">Target Audience</label>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Freelancers, agency owners (25-45)"
                maxLength={300}
                className="w-full rounded-xl border border-white/10 bg-[#16162a]/80 px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-violet-500 focus:bg-[#1a1a32]"
              />
            </div>

            {/* Tone of Voice & Primary Objective in a 2-Column Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">Tone of Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as AITone)}
                  className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500"
                >
                  {tones.map((t) => (
                    <option key={t.value} value={t.value} className="bg-[#16162a] text-white">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">Primary Objective</label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as AIObjective)}
                  className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500"
                >
                  {objectives.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#16162a] text-white">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/70">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500"
              >
                <option value="" className="bg-[#16162a] text-white">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#16162a] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={generate}
            disabled={isPending}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer pt-0"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Crafting with AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>{content ? "Regenerate Content" : "Generate Content"}</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Output Canvas Area */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 min-w-0">
          {!content ? (
            /* Empty State */
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c16]/90 p-10 sm:p-14 text-center backdrop-blur-xl shadow-xl space-y-6 flex flex-col items-center justify-center min-h-[520px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shadow-inner">
                <Sparkles size={30} />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-white">Ready to create your post</h3>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                  Enter your topic on the left and choose your target platform. ContentAI will synthesize a high-converting hook, caption, call to action, and hashtags.
                </p>
              </div>
              <div className="pt-3 flex flex-wrap justify-center gap-2 max-w-lg">
                {[
                  "5 productivity habits for founders",
                  "Behind the scenes of our new product launch",
                  "Why consistency beats intensity every time",
                ].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 hover:text-white hover:border-violet-500/40 hover:bg-violet-500/10 transition cursor-pointer"
                  >
                    💡 {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Generated Content Cards */
            <div className="space-y-6">
              {/* Studio Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0c0c16]/95 p-4 sm:p-5 shadow-lg">
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      provider === "mock" ? "bg-amber-400 shadow-sm shadow-amber-400/50" : "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                    }`}
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Generated for {platform}
                    </span>
                    <span className="text-[11px] text-white/40 ml-2">
                      via {provider === "mock" ? "Demo Mode" : provider}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => copyText(`${content.hook}\n\n${content.caption}\n\n${content.cta}\n\n${content.hashtags.join(" ")}`, "Full post")}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition cursor-pointer"
                  >
                    <Clipboard size={14} />
                    <span>Copy All</span>
                  </button>
                  <button
                    type="button"
                    onClick={generate}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Card 1: Hook Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-5 sm:p-6 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                      Hook / Attention Grabber
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(content.hook, "Hook")}
                    className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition px-2.5 py-1 rounded-lg hover:bg-white/[0.05] cursor-pointer"
                    title="Copy hook"
                  >
                    <Clipboard size={13} />
                    <span>Copy</span>
                  </button>
                </div>
                <input
                  value={content.hook}
                  onChange={(e) => updateField("hook", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#16162a] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30"
                />
              </div>

              {/* Card 2: Main Caption Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-5 sm:p-6 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                      Post Caption / Story
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(content.caption, "Caption")}
                    className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition px-2.5 py-1 rounded-lg hover:bg-white/[0.05] cursor-pointer"
                    title="Copy caption"
                  >
                    <Clipboard size={13} />
                    <span>Copy</span>
                  </button>
                </div>
                <textarea
                  value={content.caption}
                  onChange={(e) => updateField("caption", e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-white/10 bg-[#16162a] p-4 text-sm text-white/90 outline-none leading-relaxed transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 resize-y"
                  style={{ minHeight: 145 }}
                />
              </div>

              {/* Card 3: 2-Column Row for CTA & Hashtags (responsive) */}
              <div className="grid gap-5 xl:grid-cols-2">
                {/* CTA */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                        Call to Action (CTA)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(content.cta, "CTA")}
                      className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/[0.05] cursor-pointer"
                    >
                      <Clipboard size={13} />
                      <span>Copy</span>
                    </button>
                  </div>
                  <input
                    value={content.cta}
                    onChange={(e) => updateField("cta", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none transition focus:border-violet-500"
                  />
                </div>

                {/* Hashtags */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                        Hashtags ({content.hashtags.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(content.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(" "), "Hashtags")}
                      className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/[0.05] cursor-pointer"
                    >
                      <Clipboard size={13} />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
                    {content.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-violet-500/10 border border-violet-500/25 px-2.5 py-1 text-xs font-medium text-violet-300 hover:bg-violet-500/20 transition cursor-default"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 4: Visual Direction & Image Studio Link */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a] p-5 sm:p-6 shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
                      <ImageIcon size={15} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white">Visual Art Direction</span>
                  </div>
                  <Link
                    href={`/image-studio?prompt=${encodeURIComponent(content.imagePrompt)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl hover:bg-violet-500/20 transition cursor-pointer"
                  >
                    <span>Generate in Image Studio</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
                <p className="text-xs sm:text-sm text-white/80 italic bg-[#16162a]/90 p-4 rounded-xl border border-white/10 leading-relaxed">
                  &ldquo;{content.imagePrompt}&rdquo;
                </p>
              </div>

              {/* Card 5: Publishing & Scheduling Actions */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c16]/95 p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white">Ready to Publish or Schedule?</div>
                      <div className="text-xs text-white/50">Save directly to your workspace posts or calendar</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2 text-xs text-white outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => save("DRAFT")}
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save as Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => save("SCHEDULED")}
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-50 cursor-pointer"
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
