"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Zap,
  Bot,
  Check,
  X,
  Send,
  Loader2,
  FileText,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { PlatformBadge } from "@/components/posts/platform-badge";
import { PostStatusBadge } from "@/components/posts/post-status";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 shadow-xl ${
        accent
          ? "border-violet-500/30 bg-gradient-to-br from-violet-600/10 via-[#0e0e1a]/90 to-indigo-600/10"
          : "border-white/[0.08] bg-[#0e0e1a]/85 hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          {label}
        </span>
        {accent && (
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
            <Sparkles size={12} />
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
        {value}
      </div>
      {change && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
          {trend === "up" && <TrendingUp size={12} className="text-emerald-400" />}
          {trend === "down" && <TrendingDown size={12} className="text-rose-400" />}
          <span
            className={
              trend === "up"
                ? "text-emerald-400"
                : trend === "down"
                ? "text-rose-400"
                : "text-white/40"
            }
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

function PerformanceChart() {
  const days = ["May 19", "May 20", "May 21", "May 22", "May 23", "May 24", "May 25"];
  const series = [
    { name: "Reach", color: "#8b5cf6", values: [40, 55, 48, 70, 65, 90, 100] },
    { name: "Engagement", color: "#a855f7", values: [20, 30, 35, 40, 38, 55, 62] },
    { name: "Clicks", color: "#3b82f6", values: [10, 14, 12, 22, 18, 30, 34] },
  ];
  const w = 560,
    h = 160,
    pad = 12;
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
    <div className="space-y-3">
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3">
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="overflow-visible">
          {series.map((s) => (
            <polyline
              key={s.name}
              points={toPoints(s.values)}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
        <div className="flex justify-between pt-2 px-1">
          {days.map((d) => (
            <span key={d} className="text-[10.5px] font-mono text-white/35">
              {d.split(" ")[1]}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 pt-1">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}88` }}
            />
            <span className="text-xs font-medium text-white/60">{s.name}</span>
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

  async function sendMessage(suggestedText?: string) {
    const textToSend = (suggestedText || input).trim();
    if (!textToSend) return;
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    if (!suggestedText) setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
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
    <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-950/20 via-[#0e0e1a]/90 to-indigo-950/20 p-5 shadow-xl">
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/25">
          <Bot size={14} />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">
            AI Assistant
          </span>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="py-3 space-y-2.5">
          <p className="text-xs text-white/50 leading-relaxed">
            Content suggestions designed for higher audience engagement:
          </p>
          <div className="space-y-1.5">
            {aiSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs text-white/75 hover:border-violet-500/30 hover:bg-violet-500/[0.08] hover:text-white transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="my-3 max-h-48 overflow-y-auto space-y-2.5 pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-xl px-3.5 py-2 text-xs leading-relaxed max-w-[88%] ${
                m.role === "user"
                  ? "ml-auto bg-violet-600 text-white"
                  : "bg-white/[0.05] text-white/90 border border-white/10"
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-white/40 italic">
              <Loader2 size={12} className="animate-spin" /> Thinking...
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask AI for hooks, ideas, captions..."
          className="h-9 flex-1 rounded-xl border border-white/10 bg-[#121222] px-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-violet-500 transition"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 transition cursor-pointer shadow-sm"
          aria-label="Send message"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const metrics = [
    { label: "Total Posts", value: "142", change: "+12 this month", trend: "up" as const, accent: true },
    { label: "Scheduled", value: "23", change: "Next 7 days", trend: "flat" as const },
    { label: "Published", value: "118", change: "+8 vs last month", trend: "up" as const },
    { label: "Avg. Engagement", value: "4.2%", change: "–0.3%", trend: "down" as const },
  ];

  const recentPosts = [
    { title: "5 AI tools every creator needs in 2025", platform: "LINKEDIN" as const, status: "PUBLISHED" as const, date: "Apr 9" },
    { title: "Behind the scenes: our content process", platform: "INSTAGRAM" as const, status: "SCHEDULED" as const, date: "Apr 11" },
    { title: "Thread: How we grew to 10k followers", platform: "X" as const, status: "DRAFT" as const, date: "—" },
    { title: "Monthly roundup: March highlights", platform: "LINKEDIN" as const, status: "PUBLISHED" as const, date: "Apr 1" },
  ];

  const pipeline = [
    { label: "Idea", count: 18, color: "text-white/50" },
    { label: "In Progress", count: 12, color: "text-amber-400" },
    { label: "Review", count: 7, color: "text-sky-400" },
    { label: "Approved", count: 24, color: "text-violet-400" },
    { label: "Scheduled", count: 24, color: "text-emerald-400" },
  ];

  const approvalQueue = [
    { title: "New Project Spotlight", platform: "FACEBOOK", time: "May 23, 10:30 AM" },
    { title: "5 Content Tips That Actually Work", platform: "LINKEDIN", time: "May 23, 03:00 PM" },
  ];

  return (
    <div className="page animate-fade-up">
      <div className="mx-auto max-w-7xl space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">
              ✦ Workspace Overview
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {getGreeting()}
            </h1>
            <p className="text-xs sm:text-sm text-white/50">
              Here&apos;s a quick snapshot of your active content, campaigns, and scheduling pipeline.
            </p>
          </div>
          <Link
            href="/ai-studio"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition"
          >
            <Sparkles size={13} />
            <span>Create with AI</span>
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Content Pipeline */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25">
              <Zap size={14} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Content Pipeline
            </span>
          </div>

          <div className="grid grid-cols-5 items-center gap-2">
            {pipeline.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex-1 text-center">
                  <div className={`text-xl sm:text-2xl font-bold ${step.color}`}>
                    {step.count}
                  </div>
                  <div className="text-[11px] text-white/40 mt-1 uppercase tracking-wider">
                    {step.label}
                  </div>
                </div>
                {i < pipeline.length - 1 && (
                  <ArrowRight size={14} className="text-white/20 shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Recent Content Table */}
          <div className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.015]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  <FileText size={15} />
                </div>
                <h2 className="text-sm font-semibold text-white">Recent Content</h2>
              </div>
              <Link
                href="/posts"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition"
              >
                <span>View all posts</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01] text-[10.5px] uppercase tracking-wider font-semibold text-white/40">
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Platform</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentPosts.map((p) => (
                    <tr key={p.title} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-3.5 max-w-xs">
                        <span className="truncate block text-xs sm:text-sm font-medium text-white">
                          {p.title}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <PlatformBadge platform={p.platform} />
                      </td>
                      <td className="px-6 py-3.5">
                        <PostStatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-3.5 text-right font-mono text-xs text-white/40">
                        {p.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Performance, AI Assistant & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Content Performance */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Content Performance
                </h3>
                <span className="text-[11px] text-white/40 font-medium">This Week</span>
              </div>
              <PerformanceChart />
            </div>

            {/* AI Assistant */}
            <AIAssistant />

            {/* Approval Queue */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.015]">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Approval Queue
                </span>
                <Link
                  href="/posts?status=DRAFT"
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 transition"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {approvalQueue.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/[0.02] transition"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-white">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5">
                        {item.platform} &middot; {item.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                        title="Approve"
                      >
                        <Check size={11} />
                      </button>
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                        title="Decline"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-5 shadow-xl space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70 block pb-2 border-b border-white/[0.06]">
                Quick Actions
              </span>
              <div className="space-y-1">
                {[
                  { icon: Plus, label: "New post", href: "/posts/new" },
                  { icon: Sparkles, label: "AI Studio generator", href: "/ai-studio" },
                  { icon: CalendarDays, label: "Content calendar", href: "/calendar" },
                  { icon: CheckCircle2, label: "Review draft batch", href: "/posts?status=DRAFT" },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition group"
                  >
                    <Icon size={14} className="text-white/40 group-hover:text-violet-400 transition" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
