"use client";

import { useState, useEffect } from "react";
import {
  Sparkles, TrendingUp, TrendingDown, Plus, ArrowRight, Clock,
  CheckCircle2, Zap, Bot, Check, X, Send, Loader2, Image as ImageIcon,
  Film, Megaphone, CalendarDays, RadioTower, BarChart3, FolderKanban,
  Sliders, Copy, ExternalLink, Play, Eye
} from "lucide-react";
import Link from "next/link";

function getGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Good night";
}

function MetricCard({
  label, value, change, trend, accent
}: {
  label: string; value: string | number;
  change?: string; trend?: "up" | "down" | "flat"; accent?: boolean;
}) {
  return (
    <div className={`metric-card${accent ? " accent" : ""}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {change && (
        <div className={`metric-change ${trend ?? "flat"}`}>
          {trend === "up" && <TrendingUp size={11} />}
          {trend === "down" && <TrendingDown size={11} />}
          {change}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "badge badge-success", live: "badge badge-success",
    scheduled: "badge badge-info", draft: "badge badge-muted", error: "badge badge-error",
  };
  const dotClass: Record<string, string> = {
    published: "live", live: "live", scheduled: "scheduled", draft: "draft", error: "error"
  };
  return (
    <span className={map[status] ?? "badge badge-muted"}>
      <span className={`status-dot ${dotClass[status] ?? "draft"}`} style={{ marginRight: 4 }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PerformanceChart() {
  const days = ["May 19", "May 20", "May 21", "May 22", "May 23", "May 24", "May 25"];
  const series = [
    { name: "Reach", color: "var(--accent)", values: [40, 55, 48, 70, 65, 90, 100] },
    { name: "Engagement", color: "var(--purple)", values: [20, 30, 35, 40, 38, 55, 62] },
    { name: "Clicks", color: "var(--blue)", values: [10, 14, 12, 22, 18, 30, 34] },
  ];
  const w = 560, h = 160, pad = 8;
  const max = Math.max(...series.flatMap((s) => s.values));
  const toPoints = (values: number[]) =>
    values.map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${x},${y}`;
    }).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }}>
        {series.map((s) => (
          <polyline key={s.name} points={toPoints(s.values)} fill="none"
            stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {days.map((d) => <span key={d} style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.split(" ")[1]}</span>)}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
        {series.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const aiSuggestions = [
    "Carousel: 5 productivity hacks for marketers",
    "Reel: Day in the life of a creative team",
    "Post: Industry insight with a strong hook",
  ];

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply ?? "No response." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-card" style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <Bot size={13} style={{ color: "var(--accent)" }} />
        <span className="ai-tag">AI Assistant</span>
      </div>
      {messages.length === 0 && (
        <>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>
            Here are some content ideas for this week designed for higher engagement:
          </p>
          <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            {aiSuggestions.map((s) => (
              <li key={s} style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.5 }}>{s}</li>
            ))}
          </ul>
        </>
      )}
      {messages.length > 0 && (
        <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "var(--accent)" : "var(--bg-elevated)",
              color: m.role === "user" ? "#fff" : "var(--text-primary)",
              borderRadius: 10, padding: "7px 11px", fontSize: 12, maxWidth: "85%", lineHeight: 1.5,
            }}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
              <Loader2 size={12} className="animate-spin" /> Thinking...
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask AI anything..."
          style={{
            flex: 1, background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: "var(--r-md)", padding: "8px 10px", fontSize: 12,
            color: "var(--text-primary)", outline: "none",
          }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="btn btn-primary btn-sm" style={{ padding: "8px 10px" }} aria-label="Send">
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

// Interactive In-Dashboard Quick Studio
function QuickStudio() {
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<"copy" | "image">("copy");
  const [platform, setPlatform] = useState("Instagram");
  const [result, setResult] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  function handleQuickGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      if (format === "copy") {
        setResult(
          `🚀 Hook: Stop scrolling if you want to double your reach this month.\n\n` +
          `Caption: Consistent content isn't about working harder—it's about smart systems. Using AI to brainstorm, plan, and schedule frees you up to engage with your audience.\n\n` +
          `CTA: Drop a '💡' below if you agree, or tap the link in bio to try our full studio.\n\n` +
          `#ContentStrategy #GrowthHacks #${platform}Tips #CreatorEconomy`
        );
      } else {
        setResult(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`);
      }
    }, 1000);
  }

  return (
    <div className="card-glow p-5 sm:p-7 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
            <Sparkles size={13} /> Instant Playground
          </div>
          <h3 className="text-lg font-bold text-white">Generate Content or Visuals in Seconds</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setFormat("copy"); setResult(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              format === "copy" ? "bg-violet-600 text-white" : "text-white/60 hover:text-white bg-white/[0.04]"
            }`}
          >
            Social Copy
          </button>
          <button
            type="button"
            onClick={() => { setFormat("image"); setResult(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              format === "image" ? "bg-violet-600 text-white" : "text-white/60 hover:text-white bg-white/[0.04]"
            }`}
          >
            AI Image
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-white/70 block">
          {format === "copy" ? "What is your post about?" : "Describe the image you want to generate:"}
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuickGenerate()}
            placeholder={
              format === "copy"
                ? "e.g., 5 game-changing productivity hacks for modern designers"
                : "e.g., Luxury gold chronograph watch on dark obsidian stone, cinematic studio lighting"
            }
            className="ai-input flex-1"
          />
          {format === "copy" && (
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="ai-input sm:w-36 text-xs"
            >
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="X">X (Twitter)</option>
              <option value="Facebook">Facebook</option>
            </select>
          )}
          <button
            type="button"
            onClick={handleQuickGenerate}
            disabled={generating || !prompt.trim()}
            className="btn btn-ai shrink-0"
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate Now
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-4 p-4 rounded-xl bg-black/40 border border-violet-500/30 animate-fade-in">
          <div className="flex items-center justify-between mb-3 text-xs text-violet-300 font-semibold">
            <span>Live Output Preview</span>
            <div className="flex items-center gap-2">
              <Link
                href={format === "copy" ? "/ai-studio" : `/image-studio?prompt=${encodeURIComponent(prompt)}`}
                className="text-white/60 hover:text-white inline-flex items-center gap-1 text-[11px]"
              >
                Open in Full Studio <ArrowRight size={11} />
              </Link>
            </div>
          </div>
          {format === "copy" ? (
            <pre className="text-xs text-white/90 whitespace-pre-wrap font-sans leading-relaxed">
              {result}
            </pre>
          ) : (
            <div className="relative aspect-video max-w-lg mx-auto rounded-lg overflow-hidden border border-white/10">
              <img src={result} alt="Generated visual" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState(() => getGreeting());
  const [activeTab, setActiveTab] = useState<"tools" | "overview" | "pipeline" | "quick">("tools");

  useEffect(() => {
    setGreeting(getGreeting(new Date()));
  }, []);

  const metrics = [
    { label: "Total Posts", value: "142", change: "+12 this month", trend: "up" as const, accent: true },
    { label: "Scheduled", value: "23", change: "Next 7 days", trend: "flat" as const },
    { label: "Published", value: "118", change: "+8 vs last month", trend: "up" as const },
    { label: "Avg. Engagement", value: "4.2%", change: "–0.3%", trend: "down" as const },
  ];

  const recentPosts = [
    { title: "5 AI tools every creator needs in 2025", platform: "LinkedIn", status: "published", date: "Apr 9" },
    { title: "Behind the scenes: our content process", platform: "Instagram", status: "scheduled", date: "Apr 11" },
    { title: "Thread: How we grew to 10k followers", platform: "Twitter", status: "draft", date: "—" },
    { title: "Monthly roundup: March highlights", platform: "LinkedIn", status: "published", date: "Apr 1" },
  ];

  const pipeline = [
    { label: "Idea", count: 18, color: "var(--text-muted)" },
    { label: "In Progress", count: 12, color: "var(--amber)" },
    { label: "Review", count: 7, color: "var(--blue)" },
    { label: "Approved", count: 24, color: "var(--accent)" },
    { label: "Scheduled", count: 24, color: "var(--green)" },
  ];

  const approvalQueue = [
    { title: "New Project Spotlight", platform: "Facebook", time: "May 23, 10:30 AM" },
    { title: "5 Content Tips That Actually Work", platform: "LinkedIn", time: "May 23, 03:00 PM" },
  ];

  // Visual Tool Cards (Matching the reference design with visual preview cards)
  const toolCards = [
    {
      id: "image-studio",
      title: "Image Generator",
      badge: "Visual AI Studio",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: "Synthesize high-fidelity promotional imagery, mockups, and art directly from text prompts using Flux.",
      previewType: "image",
      previewUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80",
      previewLabel: "Photorealistic & Creative Styles",
      tags: ["1:1 Square", "16:9 Banner", "9:16 Story", "Flux AI"],
      href: "/image-studio",
      actionText: "Open Image Studio",
      icon: ImageIcon,
    },
    {
      id: "ai-studio",
      title: "AI Content Studio",
      badge: "Copywriting Engine",
      badgeColor: "bg-violet-500/10 text-violet-300 border-violet-500/30",
      description: "Generate viral social hooks, engaging captions, and high-conversion CTAs tailored for every platform.",
      previewType: "copy",
      previewHook: "🔥 3 secrets high-growth brands use daily...",
      previewCaption: "Crafting sticky social posts doesn't require a whole copywriting team. With AI guidance, you test multiple hooks in seconds.",
      tags: ["Hooks", "Captions", "CTAs", "Hashtags"],
      href: "/ai-studio",
      actionText: "Generate Content",
      icon: Sparkles,
    },
    {
      id: "video-studio",
      title: "Video & Reel Studio",
      badge: "Short-Form Video",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      description: "Craft short-form video concepts, viral hook storyboards, and animated clips tailored for TikTok & Reels.",
      previewType: "video",
      previewUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=700&q=80",
      previewLabel: "0:30 Reel Storyboard",
      tags: ["Viral Hooks", "Scene Prompts", "Reels & TikTok"],
      href: "/image-studio?tab=video",
      actionText: "Create Video",
      icon: Film,
    },
    {
      id: "campaigns",
      title: "Campaign Generator",
      badge: "Multi-Day Strategy",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description: "Plan cohesive 7-day or 30-day marketing campaigns with per-day regeneration and one-click calendar export.",
      previewType: "timeline",
      previewDays: ["Day 1: Problem Teaser", "Day 3: Solution Showcase", "Day 5: Customer Proof", "Day 7: Launch CTA"],
      tags: ["7-Day Blast", "Product Launch", "Multi-Channel"],
      href: "/campaigns",
      actionText: "Build Campaign",
      icon: Megaphone,
    },
    {
      id: "calendar",
      title: "Content Calendar",
      badge: "Visual Schedule",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      description: "Organize, schedule, and drag-and-drop posts into optimal posting time slots across Instagram, X, and LinkedIn.",
      previewType: "calendar",
      previewSlots: [
        { day: "Mon", status: "Published", platform: "LinkedIn" },
        { day: "Wed", status: "Scheduled", platform: "Instagram" },
        { day: "Fri", status: "Draft", platform: "X" },
      ],
      tags: ["Drag & Drop", "Time Slots", "Multi-Account"],
      href: "/calendar",
      actionText: "View Calendar",
      icon: CalendarDays,
    },
    {
      id: "publishing",
      title: "Social Publishing Hub",
      badge: "Distribution",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      description: "Connect Meta, LinkedIn, and X. Review scheduled posts and automate publication with cron background jobs.",
      previewType: "social",
      connectedAccounts: ["Instagram", "LinkedIn", "Facebook", "X"],
      tags: ["Auto-Publish", "OAuth Connections", "Cron Sync"],
      href: "/publishing",
      actionText: "Manage Channels",
      icon: RadioTower,
    },
    {
      id: "analytics",
      title: "Content Intelligence",
      badge: "Performance AI",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      description: "Analyze engagement metrics, best-performing post categories, and receive AI-driven content optimization scores.",
      previewType: "score",
      scoreValue: "94/100",
      scoreFeedback: "High hook clarity & readability",
      tags: ["0–100 Score", "Audience Retention", "Category ROI"],
      href: "/analytics",
      actionText: "View Analytics",
      icon: BarChart3,
    },
    {
      id: "media-library",
      title: "Media & Asset Cloud",
      badge: "Workspace Storage",
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
      description: "Secure workspace cloud storage for images, brand watermarks, logos, and generated assets ready to attach.",
      previewType: "assets",
      assetCount: "128 Assets",
      tags: ["Cloud Storage", "Watermarks", "Instant Attach"],
      href: "/media-library",
      actionText: "Browse Media",
      icon: FolderKanban,
    },
  ];

  return (
    <div className="page animate-fade-in space-y-10 max-w-[1440px] mx-auto pb-16">
      {/* ═══════════════════════════════════════════════════
          FULL-PAGE HERO SECTION
          Inspired by user reference showcase:
          "Videos, and Tools in One Place"
      ═══════════════════════════════════════════════════ */}
      <section className="text-center pt-4 sm:pt-10 pb-4 max-w-4xl mx-auto px-4 space-y-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 shadow-sm">
          <Sparkles size={13} className="text-violet-400" />
          <span>ContentAI Creative Suite</span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        </div>

        {/* Big Display Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
          AI Content, Images,{" "}
          <span className="italic font-serif bg-gradient-to-r from-violet-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">
            Videos, and Tools
          </span>{" "}
          in One Place
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
          Turn ideas into visuals and workflows instantly. Generate AI images, create videos,
          write viral copy, and explore powerful tools—without complexity.
        </p>

        {/* Action Buttons: Vibrant Glowing Pill CTA matching reference */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/ai-studio" className="btn-hero-glow">
            <span>Get started for free</span>
            <Sparkles size={15} />
          </Link>
          <Link
            href="/image-studio"
            className="btn btn-primary"
            style={{ borderRadius: 9999, padding: "11px 22px", fontSize: 13.5 }}
          >
            <ImageIcon size={15} />
            <span>Image Studio</span>
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab("quick")}
            className="btn btn-ghost"
            style={{ borderRadius: 9999, padding: "11px 18px", fontSize: 13.5 }}
          >
            <Zap size={14} className="text-amber-400" />
            <span>Instant Playground</span>
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          WORKSPACE TABS BAR
      ═══════════════════════════════════════════════════ */}
      <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto no-scrollbar px-1">
        <button
          type="button"
          onClick={() => setActiveTab("tools")}
          className={`workspace-tab-btn${activeTab === "tools" ? " active" : ""}`}
        >
          <Sparkles size={14} />
          <span>Creative Tools &amp; Studios</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`workspace-tab-btn${activeTab === "overview" ? " active" : ""}`}
        >
          <BarChart3 size={14} />
          <span>Performance &amp; Metrics</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pipeline")}
          className={`workspace-tab-btn${activeTab === "pipeline" ? " active" : ""}`}
        >
          <Zap size={14} />
          <span>Content Pipeline &amp; Approvals</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("quick")}
          className={`workspace-tab-btn${activeTab === "quick" ? " active" : ""}`}
        >
          <Sliders size={14} />
          <span>Instant Studio</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          TAB 1: CREATIVE TOOLS & STUDIOS (VISUAL CARD SHOWCASE)
          Directly matches the user's reference image!
      ═══════════════════════════════════════════════════ */}
      {activeTab === "tools" && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Explore Studio Tools
              </h2>
              <p className="text-xs sm:text-sm text-white/50 mt-0.5">
                Launch any creator engine to generate copy, visuals, schedules, and campaigns.
              </p>
            </div>
            <span className="text-xs font-semibold text-white/40 hidden sm:inline">
              8 Available Studios
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {toolCards.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.id} className="tool-showcase-card group">
                  {/* Visual Preview Frame */}
                  <div className="p-3.5 pb-0">
                    <div className="tool-preview-frame aspect-[16/10] relative flex items-center justify-center overflow-hidden">
                      {/* Image Preview */}
                      {tool.previewType === "image" && (
                        <div className="w-full h-full relative">
                          <img
                            src={tool.previewUrl}
                            alt={tool.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white/90">
                            <span className="font-semibold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                              {tool.previewLabel}
                            </span>
                            <span className="text-emerald-400 font-bold">Flux ✦</span>
                          </div>
                        </div>
                      )}

                      {/* Video Preview */}
                      {tool.previewType === "video" && (
                        <div className="w-full h-full relative">
                          <img
                            src={tool.previewUrl}
                            alt={tool.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-violet-600/90 border border-violet-400/40 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
                              <Play size={16} fill="white" className="ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-white border border-white/10">
                            0:30 Video Prompt
                          </div>
                        </div>
                      )}

                      {/* Copy Preview */}
                      {tool.previewType === "copy" && (
                        <div className="w-full h-full p-3 bg-gradient-to-br from-violet-950/40 to-black/60 flex flex-col justify-between text-[11px]">
                          <div className="text-violet-300 font-bold truncate">
                            {tool.previewHook}
                          </div>
                          <p className="text-white/60 line-clamp-2 text-[10.5px] leading-relaxed my-1">
                            {tool.previewCaption}
                          </p>
                          <div className="flex gap-1.5 text-[9.5px] text-violet-400 font-semibold">
                            <span>#Strategy</span>
                            <span>#Growth</span>
                            <span>#Creator</span>
                          </div>
                        </div>
                      )}

                      {/* Campaign Timeline Preview */}
                      {tool.previewType === "timeline" && (
                        <div className="w-full h-full p-3 bg-gradient-to-br from-amber-950/30 to-black/60 flex flex-col justify-around text-[10.5px]">
                          {tool.previewDays?.map((day, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-white/80">
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                              <span className="truncate font-medium">{day}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Calendar Preview */}
                      {tool.previewType === "calendar" && (
                        <div className="w-full h-full p-3 bg-gradient-to-br from-blue-950/30 to-black/60 flex flex-col justify-around text-[11px]">
                          {tool.previewSlots?.map((slot, idx) => (
                            <div key={idx} className="flex items-center justify-between text-white/80 border-b border-white/[0.04] pb-1">
                              <span className="font-semibold text-blue-300">{slot.day}</span>
                              <span className="text-[10px] text-white/50">{slot.platform}</span>
                              <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                                {slot.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Social Publishing Preview */}
                      {tool.previewType === "social" && (
                        <div className="w-full h-full p-3 bg-gradient-to-br from-cyan-950/30 to-black/60 flex flex-col justify-center gap-2 text-[11px]">
                          <div className="text-xs text-white/60 text-center font-medium">1-Click Connected Channels</div>
                          <div className="grid grid-cols-2 gap-1.5 text-center">
                            {tool.connectedAccounts?.map((acc) => (
                              <div key={acc} className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06] text-[10px] text-cyan-300 font-semibold">
                                ✓ {acc}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Score Preview */}
                      {tool.previewType === "score" && (
                        <div className="w-full h-full p-3 bg-gradient-to-br from-purple-950/30 to-black/60 flex flex-col items-center justify-center text-center">
                          <div className="text-2xl font-black text-purple-300 tracking-tight">
                            {tool.scoreValue}
                          </div>
                          <div className="text-[11px] text-white/70 font-semibold mt-1">
                            {tool.scoreFeedback}
                          </div>
                          <span className="mt-1.5 text-[9.5px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                            Grade: A+ (Viral Ready)
                          </span>
                        </div>
                      )}

                      {/* Assets Preview */}
                      {tool.previewType === "assets" && (
                        <div className="w-full h-full p-3 bg-gradient-to-br from-teal-950/30 to-black/60 flex flex-col items-center justify-center text-center">
                          <FolderKanban size={26} className="text-teal-400 mb-1" />
                          <div className="text-sm font-bold text-white">{tool.assetCount}</div>
                          <div className="text-[10px] text-white/50">Private Supabase Storage</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Badge & Title */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                        <Icon size={14} className="text-white/40 group-hover:text-violet-400 transition" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-white/60 leading-relaxed mt-1 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>

                    {/* Tags & Action */}
                    <div className="space-y-3 pt-2 border-t border-white/[0.05]">
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/50 border border-white/[0.04]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={tool.href}
                        className="btn btn-primary w-full text-xs font-semibold justify-between group-hover:border-violet-500/50 group-hover:bg-violet-600/10 transition"
                      >
                        <span>{tool.actionText}</span>
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 2: PERFORMANCE & METRICS
      ═══════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <section className="space-y-6 animate-fade-in">
          <div className="metrics-grid">
            {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
          </div>

          <div className="dashboard-grid">
            <div className="card" style={{ minWidth: 0 }}>
              <div className="card-h">
                <span className="card-title">Recent Published &amp; Scheduled Posts</span>
                <Link href="/posts" className="btn btn-ghost btn-sm" style={{ fontSize: 11.5 }}>
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Title</th><th>Platform</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {recentPosts.map((p) => (
                      <tr key={p.title}>
                        <td>
                          <span style={{ display: "block", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 450 }}>
                            {p.title}
                          </span>
                        </td>
                        <td><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.platform}</span></td>
                        <td><StatusBadge status={p.status} /></td>
                        <td><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.date}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
              <div className="card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justify-content: "space-between", marginBottom: 12 }}>
                  <span className="card-title">Weekly Engagement Trends</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>May 19 - 25</span>
                </div>
                <PerformanceChart />
              </div>

              <AIAssistant />
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 3: CONTENT PIPELINE & APPROVALS
      ═══════════════════════════════════════════════════ */}
      {activeTab === "pipeline" && (
        <section className="space-y-6 animate-fade-in">
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Zap size={14} style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                Active Production Pipeline
              </span>
            </div>
            <div className="overflow-x-auto no-scrollbar pb-2">
              <div style={{ display: "flex", alignItems: "center", minWidth: 500 }}>
                {pipeline.map((step, i) => (
                  <div key={step.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div style={{ flex: 1, textAlign: "center", padding: "8px" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: step.color, letterSpacing: "-0.03em" }}>
                        {step.count}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginTop: 4 }}>
                        {step.label}
                      </div>
                    </div>
                    {i < pipeline.length - 1 && (
                      <ArrowRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="card">
              <div className="card-h">
                <span className="card-title">Pending Approvals</span>
                <Link href="/posts?status=review" className="btn btn-ghost btn-sm" style={{ fontSize: 11.5 }}>
                  Review All
                </Link>
              </div>
              <div style={{ padding: "8px 12px" }}>
                {approvalQueue.map((item) => (
                  <div
                    key={item.title}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 8px", borderBottom: "1px solid var(--border-subtle)"
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {item.platform} · {item.time}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                      <span style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--green-soft)", color: "var(--green)" }}>
                        <Check size={13} />
                      </span>
                      <span style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--red-soft)", color: "var(--red)" }}>
                        <X size={13} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <span className="card-title">Quick Scheduling Actions</span>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { icon: Plus, label: "Create fresh post draft", href: "/posts/new" },
                  { icon: Sparkles, label: "Generate structured social copy with AI", href: "/ai-studio" },
                  { icon: ImageIcon, label: "Generate visual asset with Flux", href: "/image-studio" },
                  { icon: Clock, label: "Open full drag-and-drop calendar", href: "/calendar" },
                  { icon: CheckCircle2, label: "Filter pending drafts", href: "/posts?status=draft" },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="sb-link"
                    style={{ padding: "10px 12px", borderRadius: "var(--r-md)" }}
                  >
                    <Icon size={15} style={{ color: "var(--accent)" }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB 4: INSTANT IN-DASHBOARD QUICK STUDIO
      ═══════════════════════════════════════════════════ */}
      {activeTab === "quick" && (
        <section className="animate-fade-in max-w-4xl mx-auto">
          <QuickStudio />
        </section>
      )}
    </div>
  );
}
