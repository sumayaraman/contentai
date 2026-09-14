"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Check,
  Clipboard,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  Calendar,
  Layers,
  WandSparkles,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  generateCampaign,
  addCampaignToCalendar,
  addCampaignDayToCalendar,
  regenerateCampaignDay,
  removeCampaignDay,
  updateCampaignDay,
} from "@/lib/ai/campaign-actions";
import type { Campaign, CampaignDay as StoredCampaignDay } from "@/types/database";
import type { AIObjective, AIPlatform, AITone, CampaignDay } from "@/ai/types";

const platforms: Array<[AIPlatform, string]> = [
  ["INSTAGRAM", "Instagram"],
  ["FACEBOOK", "Facebook"],
  ["LINKEDIN", "LinkedIn"],
  ["X", "X (Twitter)"],
];

const tones: Array<[AITone, string]> = [
  ["FRIENDLY", "Friendly & Approachable"],
  ["PROFESSIONAL", "Professional & Authoritative"],
  ["INSPIRATIONAL", "Inspirational & Motivating"],
  ["CASUAL", "Casual & Conversational"],
  ["FUNNY", "Humorous & Witty"],
  ["LUXURY", "Refined & Luxury"],
  ["EDUCATIONAL", "Informative & Educational"],
];

const goals: Array<[AIObjective, string]> = [
  ["AWARENESS", "Brand Awareness"],
  ["ENGAGEMENT", "Community Engagement"],
  ["SALES", "Sales & Conversions"],
  ["TRAFFIC", "Website Traffic"],
  ["LEADS", "Lead Generation"],
  ["BRAND_BUILDING", "Authority & Brand Building"],
];

const CAMPAIGN_PRESETS = [
  {
    label: "☕ 7-Day Coffee Launch",
    topic: "Grand opening of our specialty coffee shop featuring artisanal espresso, single-origin pour-overs, and daily community specials.",
    audience: "Coffee lovers, urban commuters, neighborhood locals (20-45)",
    platform: "INSTAGRAM" as AIPlatform,
    tone: "FRIENDLY" as AITone,
    goal: "AWARENESS" as AIObjective,
    duration: 7,
  },
  {
    label: "🚀 Product Drop",
    topic: "Exclusive limited-batch launch with teaser countdowns, feature highlights, early-bird bonuses, and customer reviews.",
    audience: "Existing brand fans, early adopters, design lovers",
    platform: "INSTAGRAM" as AIPlatform,
    tone: "INSPIRATIONAL" as AITone,
    goal: "SALES" as AIObjective,
    duration: 5,
  },
  {
    label: "💼 B2B Thought Leadership",
    topic: "Actionable frameworks on modern content automation, team workflow optimization, and creative scalability.",
    audience: "Founders, marketers, creative directors, team leaders",
    platform: "LINKEDIN" as AIPlatform,
    tone: "PROFESSIONAL" as AITone,
    goal: "BRAND_BUILDING" as AIObjective,
    duration: 7,
  },
  {
    label: "🎉 Weekend Flash Special",
    topic: "Weekend celebration with limited discounts, behind-the-scenes stories, and interactive polls.",
    audience: "Weekend shoppers, casual customers, social media followers",
    platform: "FACEBOOK" as AIPlatform,
    tone: "CASUAL" as AITone,
    goal: "ENGAGEMENT" as AIObjective,
    duration: 3,
  },
];

const today = () => new Date().toISOString().slice(0, 10);

export function CampaignGenerator({
  history = [],
}: {
  history?: Array<Campaign & { campaign_days: StoredCampaignDay[] }>;
}) {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState<AIPlatform>("INSTAGRAM");
  const [duration, setDuration] = useState(7);
  const [tone, setTone] = useState<AITone>("FRIENDLY");
  const [goal, setGoal] = useState<AIObjective>("AWARENESS");
  const [startDate, setStartDate] = useState(today());
  const [campaign, setCampaign] = useState<{
    id: string;
    title: string;
    days: CampaignDay[];
    provider: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function applyPreset(preset: typeof CAMPAIGN_PRESETS[0]) {
    setTopic(preset.topic);
    setAudience(preset.audience);
    setPlatform(preset.platform);
    setTone(preset.tone);
    setGoal(preset.goal);
    setDuration(preset.duration);
  }

  function generate() {
    if (!topic.trim()) {
      setError("Please describe your campaign idea or select an inspiration preset.");
      return;
    }
    setError("");
    setNotice("");
    startTransition(async () => {
      const r = await generateCampaign({
        topic,
        targetAudience: audience,
        platform,
        duration,
        tone,
        goal,
        startDate,
      });
      if (!r.ok) {
        setError(Object.values(r.errors)[0] || "Could not generate campaign.");
        return;
      }
      setCampaign({
        id: r.campaignId,
        title: r.title,
        days: r.days,
        provider: r.provider,
      });
      setNotice("Campaign plan generated and saved successfully!");
    });
  }

  function update(day: CampaignDay, key: keyof CampaignDay, value: string) {
    if (!campaign) return;
    const days = campaign.days.map((d) =>
      d.day === day.day
        ? { ...d, [key]: key === "hashtags" ? value.split(/\s+/).filter(Boolean) : value }
        : d
    );
    setCampaign({ ...campaign, days });
  }

  function regenDay(day: CampaignDay) {
    if (!campaign) return;
    setError("");
    startTransition(async () => {
      const r = await regenerateCampaignDay(campaign.id, day.day);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setCampaign({
        ...campaign,
        days: campaign.days.map((d) => (d.day === day.day ? r.day : d)),
      });
      setNotice(`Day ${day.day} regenerated with fresh creative ideas.`);
    });
  }

  function addDay(day: CampaignDay) {
    if (!campaign) return;
    startTransition(async () => {
      const r = await addCampaignDayToCalendar(campaign.id, day, true);
      if (r.ok) {
        setNotice(`Day ${day.day} scheduled to calendar.`);
      } else {
        setError(r.error || "Could not add day to calendar.");
      }
    });
  }

  function saveDay(day: CampaignDay) {
    if (!campaign) return;
    startTransition(async () => {
      const r = await updateCampaignDay(campaign.id, day);
      if (r.ok) {
        setNotice(`Day ${day.day} changes saved.`);
      } else {
        setError(r.error || "Could not save day.");
      }
    });
  }

  function remove(day: CampaignDay) {
    if (!campaign || !confirm(`Remove Day ${day.day} from this campaign?`)) return;
    startTransition(async () => {
      const r = await removeCampaignDay(campaign.id, day.day);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setCampaign({
        ...campaign,
        days: campaign.days.filter((d) => d.day !== day.day),
      });
      setNotice(`Day ${day.day} removed.`);
    });
  }

  function addCalendar(scheduled: boolean) {
    if (!campaign) return;
    startTransition(async () => {
      const r = await addCampaignToCalendar(campaign.id, campaign.days, scheduled);
      if (r.ok) {
        setNotice(`${r.count} posts successfully added to your calendar.`);
      } else {
        setError(r.error || "Could not add campaign to calendar.");
      }
    });
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Copied to clipboard!");
    } catch {
      setError("Clipboard access unavailable.");
    }
  }

  return (
    <div className="campaign-container">
      {/* Notifications */}
      {notice && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "var(--r-md)",
            color: "#4ade80",
            fontSize: 13,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={16} />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice("")}
            style={{ background: "transparent", border: "none", color: "#4ade80", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "var(--r-md)",
            color: "#f87171",
            fontSize: 13,
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Grid: Left Controls + Right Studio Stage */}
      <div className="campaign-grid">
        {/* LEFT COLUMN: Campaign Brief Form */}
        <div className="campaign-brief-panel">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--r-md)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Campaign Brief
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Define your multi-day roadmap and strategy
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 6,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Quick Presets:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CAMPAIGN_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="studio-chip"
                >
                  <Sparkles size={10} style={{ color: "var(--accent)" }} />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Idea */}
          <div>
            <div className="campaign-field-label">
              <span>Campaign Idea</span>
              {topic && (
                <button
                  type="button"
                  onClick={() => setTopic("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: 11,
                    cursor: "pointer",
                    textTransform: "none",
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="e.g., Launch our new coffee blend with origin stories, tasting notes, and launch discount codes..."
              className="campaign-input"
              style={{ resize: "vertical", minHeight: 74, lineHeight: 1.5 }}
            />
          </div>

          {/* Target Audience */}
          <div>
            <div className="campaign-field-label">
              <span>Target Audience</span>
            </div>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              maxLength={300}
              placeholder="e.g., Specialty coffee enthusiasts, urban commuters (22-45)"
              className="campaign-input"
            />
          </div>

          {/* 2-Column Row: Platform & Duration */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div className="campaign-field-label">
                <span>Platform</span>
              </div>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as AIPlatform)}
                className="campaign-input"
                style={{ height: 40 }}
              >
                {platforms.map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="campaign-field-label">
                <span>Duration</span>
              </div>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="campaign-input"
                style={{ height: 40 }}
              >
                {[3, 5, 7, 10, 14, 21, 30].map((num) => (
                  <option key={num} value={num}>
                    {num} Days
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2-Column Row: Start Date & Tone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div className="campaign-field-label">
                <span>Start Date</span>
              </div>
              <input
                type="date"
                min={today()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="campaign-input"
                style={{ height: 40 }}
              >
              </input>
            </div>

            <div>
              <div className="campaign-field-label">
                <span>Tone</span>
              </div>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as AITone)}
                className="campaign-input"
                style={{ height: 40 }}
              >
                {tones.map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaign Goal */}
          <div>
            <div className="campaign-field-label">
              <span>Campaign Goal</span>
            </div>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as AIObjective)}
              className="campaign-input"
              style={{ height: 40 }}
            >
              {goals.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={pending || !topic.trim()}
            onClick={generate}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: "var(--r-md)",
              background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
              padding: "13px 20px",
              fontSize: 14,
              fontWeight: 700,
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(109,92,255,0.35)",
              opacity: pending || !topic.trim() ? 0.6 : 1,
              marginTop: 4,
            }}
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin" size={17} /> Planning {duration}-Day Campaign…
              </>
            ) : campaign ? (
              <>
                <RefreshCw size={17} /> Regenerate Campaign Plan
              </>
            ) : (
              <>
                <Sparkles size={17} /> Generate Campaign Plan
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Campaign Studio & Output Plan */}
        <div className="campaign-stage-panel">
          {/* Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 16,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Campaign Studio
              </span>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: "4px 0 0",
                }}
              >
                {campaign?.title || "Your Campaign Plan"}
              </h2>
              {campaign && (
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  {campaign.days.length} planned posts · {platform} · {tone}
                </p>
              )}
            </div>

            {campaign && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="badge badge-ai"
                  style={{
                    fontSize: 11,
                    background:
                      campaign.provider === "mock"
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(16,185,129,0.15)",
                    color: campaign.provider === "mock" ? "#fbbf24" : "#34d399",
                    borderColor:
                      campaign.provider === "mock"
                        ? "rgba(245,158,11,0.3)"
                        : "rgba(16,185,129,0.3)",
                  }}
                >
                  {campaign.provider === "mock" ? "Demo Mode" : `AI · ${campaign.provider}`}
                </span>
              </div>
            )}
          </div>

          {/* Body Content */}
          {!campaign ? (
            /* Empty State */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: "rgba(109,92,255,0.1)",
                  border: "1px solid rgba(109,92,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a89dff",
                  marginBottom: 16,
                }}
              >
                <WandSparkles size={30} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Build Your Multi-Day Campaign
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  maxWidth: 420,
                  margin: "8px 0 28px",
                  lineHeight: 1.6,
                }}
              >
                Fill out the campaign brief on the left to automatically generate a cohesive daily
                roadmap with hooks, captions, CTAs, hashtags, and matching image prompts.
              </p>

              {/* 3 Step Highlights */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                  width: "100%",
                  maxWidth: 640,
                }}
              >
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: "16px 14px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#a89dff", marginBottom: 4 }}>
                    1. Cohesive Sequence
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Teasers, storytelling, proof points, and launch hooks scheduled across your chosen days.
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: "16px 14px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", marginBottom: 4 }}>
                    2. Full Copywriting
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    High-conversion hooks, engaging captions, clear calls to action, and targeted hashtags.
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: "16px 14px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399", marginBottom: 4 }}>
                    3. Visuals &amp; Calendar
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    One-click image studio generation for each post and instant sync to your publishing calendar.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Plan Output */
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Global Actions Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-lg)",
                  padding: "14px 18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Calendar size={18} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    Ready to schedule all {campaign.days.length} days?
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => addCalendar(false)}
                    disabled={pending || !campaign.days.length}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 6 }}
                  >
                    <Layers size={14} /> Add as Drafts
                  </button>
                  <button
                    type="button"
                    onClick={() => addCalendar(true)}
                    disabled={pending || !campaign.days.length}
                    className="btn btn-primary btn-sm"
                    style={{ gap: 6 }}
                  >
                    <CalendarPlus size={14} /> Add to Calendar
                  </button>
                </div>
              </div>

              {/* Day Cards List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {campaign.days.map((day) => (
                  <DayCard
                    key={day.day}
                    day={day}
                    pending={pending}
                    update={update}
                    save={() => saveDay(day)}
                    regenerate={() => regenDay(day)}
                    add={() => addDay(day)}
                    remove={() => remove(day)}
                    copy={() =>
                      copyText(
                        [
                          `Day ${day.day} (${day.suggestedDate.slice(0, 10)})`,
                          `Topic: ${day.contentIdea}`,
                          `Hook: ${day.hook}`,
                          `Caption:\n${day.caption}`,
                          `CTA: ${day.cta}`,
                          `Hashtags: ${day.hashtags.join(" ")}`,
                          `Image Prompt: ${day.imagePrompt}`,
                        ].join("\n\n")
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Workspace History */}
      {history.length > 0 && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Workspace History
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "4px 0 0" }}>
              Previously Generated Campaigns
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 14,
            }}
          >
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  setCampaign({
                    id: item.id,
                    title: item.title,
                    days: item.campaign_days.map((d) => ({
                      day: d.day_number,
                      contentIdea: d.content_idea,
                      hook: d.hook,
                      caption: d.caption,
                      cta: d.cta,
                      hashtags: d.hashtags,
                      imagePrompt: d.image_prompt,
                      suggestedDate: d.suggested_date,
                    })),
                    provider: item.provider,
                  })
                }
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-lg)",
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                  transition: "border-color 0.15s ease, transform 0.15s ease",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      className="badge"
                      style={{
                        fontSize: 10.5,
                        background: "var(--accent-soft)",
                        color: "#b0a0ff",
                        border: "1px solid var(--border-accent)",
                      }}
                    >
                      {item.duration_days} Days
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.platform} · {item.tone} · {item.status}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                  }}
                >
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      color: "var(--accent)",
                      fontWeight: 600,
                    }}
                  >
                    Load into Studio <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DayCard({
  day,
  pending,
  update,
  save,
  regenerate,
  add,
  remove,
  copy,
}: {
  day: CampaignDay;
  pending: boolean;
  update: (d: CampaignDay, k: keyof CampaignDay, v: string) => void;
  save: () => void;
  regenerate: () => void;
  add: () => void;
  remove: () => void;
  copy: () => void;
}) {
  return (
    <article className="campaign-day-card">
      {/* Day Header & Actions Toolbar */}
      <div className="campaign-day-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 99,
              background: "var(--accent-soft)",
              border: "1px solid var(--border-accent)",
              fontSize: 12,
              fontWeight: 800,
              color: "#c084fc",
            }}
          >
            Day {day.day}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>Date:</span>
            <input
              type="date"
              value={day.suggestedDate.slice(0, 10)}
              onChange={(e) => update(day, "suggestedDate", e.target.value)}
              style={{
                borderRadius: "var(--r-sm)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                padding: "3px 8px",
                fontSize: 12,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={copy}
            className="btn btn-ghost btn-sm"
            title="Copy day content"
            style={{ padding: "5px 10px", fontSize: 11.5, gap: 4 }}
          >
            <Clipboard size={13} /> Copy
          </button>
          <button
            type="button"
            onClick={regenerate}
            disabled={pending}
            className="btn btn-ghost btn-sm"
            title="Regenerate this day"
            style={{ padding: "5px 10px", fontSize: 11.5, gap: 4 }}
          >
            <RefreshCw size={13} /> Regenerate
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="btn btn-ghost btn-sm"
            title="Save changes"
            style={{ padding: "5px 10px", fontSize: 11.5, gap: 4 }}
          >
            <Check size={13} /> Save
          </button>
          <button
            type="button"
            onClick={add}
            disabled={pending}
            className="btn btn-primary btn-sm"
            title="Add this day to publishing calendar"
            style={{ padding: "5px 12px", fontSize: 11.5, gap: 4 }}
          >
            <CalendarPlus size={13} /> Add to Calendar
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="btn btn-ghost btn-sm"
            title="Remove day"
            style={{ padding: "5px 8px", color: "var(--red)", fontSize: 11.5 }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Grid of Content Elements */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <span className="campaign-field-label">Content Idea</span>
          <input
            value={day.contentIdea}
            onChange={(e) => update(day, "contentIdea", e.target.value)}
            className="campaign-input"
            style={{ background: "var(--bg-surface)" }}
          />
        </div>

        <div>
          <span className="campaign-field-label">Hook</span>
          <input
            value={day.hook}
            onChange={(e) => update(day, "hook", e.target.value)}
            className="campaign-input"
            style={{ background: "var(--bg-surface)" }}
          />
        </div>
      </div>

      {/* Full-width Caption */}
      <div>
        <span className="campaign-field-label">Caption</span>
        <textarea
          value={day.caption}
          onChange={(e) => update(day, "caption", e.target.value)}
          rows={3}
          className="campaign-input"
          style={{ background: "var(--bg-surface)", resize: "vertical", lineHeight: 1.55 }}
        />
      </div>

      {/* CTA & Hashtags */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <span className="campaign-field-label">Call To Action (CTA)</span>
          <input
            value={day.cta}
            onChange={(e) => update(day, "cta", e.target.value)}
            className="campaign-input"
            style={{ background: "var(--bg-surface)" }}
          />
        </div>

        <div>
          <span className="campaign-field-label">Hashtags</span>
          <input
            value={day.hashtags.join(" ")}
            onChange={(e) => update(day, "hashtags", e.target.value)}
            className="campaign-input"
            style={{ background: "var(--bg-surface)" }}
          />
        </div>
      </div>

      {/* Linked Image Prompt Box */}
      <div
        style={{
          background: "rgba(109,92,255,0.06)",
          border: "1px solid rgba(109,92,255,0.2)",
          borderRadius: "var(--r-md)",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: "#a89dff",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🎨 Suggested AI Visual Prompt
          </span>
          <Link
            href={`/image-studio?prompt=${encodeURIComponent(day.imagePrompt)}`}
            className="btn btn-ghost btn-sm"
            style={{
              fontSize: 11.5,
              padding: "3px 10px",
              color: "#c084fc",
              gap: 4,
              textDecoration: "none",
            }}
          >
            Open in Image Studio <ExternalLink size={12} />
          </Link>
        </div>
        <textarea
          value={day.imagePrompt}
          onChange={(e) => update(day, "imagePrompt", e.target.value)}
          rows={2}
          className="campaign-input"
          style={{
            background: "rgba(0,0,0,0.25)",
            borderColor: "rgba(109,92,255,0.2)",
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        />
      </div>
    </article>
  );
}

