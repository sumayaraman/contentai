"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Zap,
  ImageIcon,
  WandSparkles,
  CalendarDays,
  Megaphone,
  BarChart3,
  Check,
  X,
  Plus,
} from "lucide-react";

function getGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Good night";
}

function MetricCard({
  label,
  value,
  change,
  trend,
  accent,
}: {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "flat";
  accent?: boolean;
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
    published: "badge badge-success",
    live: "badge badge-success",
    scheduled: "badge badge-info",
    draft: "badge badge-muted",
    error: "badge badge-error",
  };
  const dotClass: Record<string, string> = {
    published: "live",
    live: "live",
    scheduled: "scheduled",
    draft: "draft",
    error: "error",
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
  const w = 560,
    h = 150,
    pad = 8;
  const max = Math.max(...series.flatMap((s) => s.values));
  const toPoints = (values: number[]) =>
    values
      .map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (w - pad * 2);
        const y = h - pad - (v / max) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }}>
        {series.map((s) => (
          <polyline
            key={s.name}
            points={toPoints(s.values)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {days.map((d) => (
          <span key={d} style={{ fontSize: 10, color: "var(--text-muted)" }}>
            {d.split(" ")[1]}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
        {series.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: s.color,
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    setGreeting(getGreeting(new Date()));
  }, []);

  const featureCards = [
    {
      icon: Sparkles,
      iconColor: "text-violet-400 bg-violet-500/20 border-violet-500/30",
      title: "AI Content",
      desc: "Create captions, hooks, CTAs and hashtags with AI.",
      btnText: "Create Content",
      href: "/ai-studio",
      highlight: true,
    },
    {
      icon: ImageIcon,
      iconColor: "text-fuchsia-400 bg-fuchsia-500/20 border-fuchsia-500/30",
      title: "Image & Video Generator",
      desc: "Create a custom image or video for your social media content.",
      btnText: "Create Visual",
      href: "/image-studio",
      highlight: false,
    },
    {
      icon: WandSparkles,
      iconColor: "text-amber-400 bg-amber-500/20 border-amber-500/30",
      title: "30-Day Content Workshop",
      desc: "Generate a complete month of branded visual content with your logo and style.",
      btnText: "Open Workshop",
      href: "/workspace",
      highlight: false,
    },
    {
      icon: CalendarDays,
      iconColor: "text-blue-400 bg-blue-500/20 border-blue-500/30",
      title: "Content Calendar",
      desc: "Plan and schedule your upcoming social media content.",
      btnText: "Open Calendar",
      href: "/calendar",
      highlight: false,
    },
    {
      icon: Megaphone,
      iconColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      title: "Campaigns",
      desc: "Organize multiple posts around one marketing goal.",
      btnText: "View Campaigns",
      href: "/campaigns",
      highlight: false,
    },
    {
      icon: BarChart3,
      iconColor: "text-purple-400 bg-purple-500/20 border-purple-500/30",
      title: "Analytics",
      desc: "Understand what content is performing and what needs improvement.",
      btnText: "View Analytics",
      href: "/analytics",
      highlight: false,
    },
  ];

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

  return (
    <div className="page animate-fade-up max-w-7xl mx-auto space-y-10 pb-16">
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#141228] via-[#0d0d1a] to-[#07070f] p-6 sm:p-10 shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <Sparkles size={13} />
            <span>{greeting} ✦ Welcome to ContentAI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Create better social content with AI.
          </h1>

          <p className="text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed">
            Create, organize, schedule, and analyze your social media content — all in one place.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/create"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-xs font-bold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 transition"
            >
              <Sparkles size={15} />
              <span>Create Content</span>
            </Link>
            <Link
              href="/ai-assistant"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
            >
              <Bot size={15} className="text-violet-400" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. "WHAT WOULD YOU LIKE TO DO?" 6-CARD FEATURE SECTION */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            What would you like to do?
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mt-0.5">
            Select a feature to start creating, planning, or optimizing your social presence.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className={`group flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                  card.highlight
                    ? "border-violet-500/30 bg-[#100f24] hover:border-violet-500/50 shadow-lg shadow-violet-600/5"
                    : "border-white/[0.08] bg-[#0c0c16]/85 backdrop-blur-xl hover:border-white/20 shadow-md"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.iconColor}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition">
                      {card.title}
                    </h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-white/[0.04]">
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 group-hover:text-violet-300 transition"
                  >
                    <span>{card.btnText}</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. WORKSPACE OVERVIEW & ACTIVITY (Preserved functionality) */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Workspace Overview</h2>
            <p className="text-xs text-white/50 mt-0.5">Summary of scheduled posts, pipeline, and recent performance.</p>
          </div>
          <Link href="/posts" className="text-xs font-semibold text-violet-400 hover:underline">
            View all content &rarr;
          </Link>
        </div>

        {/* Metrics Bar */}
        <div className="metrics-grid">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Content Pipeline Progress */}
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Zap size={14} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
              Content Pipeline
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {pipeline.map((step, i) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: step.color,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {step.count}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>
                    {step.label}
                  </div>
                </div>
                {i < pipeline.length - 1 && (
                  <ArrowRight size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Grid: Recent Content & Performance Chart */}
        <div className="dashboard-grid">
          {/* Left: Recent Content */}
          <div className="card" style={{ minWidth: 0 }}>
            <div className="card-h">
              <span className="card-title">Recent Content</span>
              <Link href="/posts" className="btn btn-ghost btn-sm" style={{ fontSize: 11.5 }}>
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Platform</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPosts.map((p) => (
                    <tr key={p.title}>
                      <td>
                        <span
                          style={{
                            display: "block",
                            maxWidth: 260,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: 450,
                          }}
                        >
                          {p.title}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.platform}</span>
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.date}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Content Performance Chart */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="card-title">Content Performance</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>This Week</span>
            </div>
            <PerformanceChart />
          </div>
        </div>
      </div>
    </div>
  );
}
