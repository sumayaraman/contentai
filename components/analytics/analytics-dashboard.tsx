"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Filter,
  Gauge,
  MessageCircle,
  PenSquare,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { scorePostContent } from "@/lib/analytics/actions";
import type { AnalyticsDashboardData } from "@/lib/analytics/types";
import type { Platform, Post } from "@/types/database";

const platformLabels: Record<Platform, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  X: "X",
};
const platformShort: Record<Platform, string> = {
  INSTAGRAM: "IG",
  FACEBOOK: "FB",
  LINKEDIN: "IN",
  X: "X",
};
const platformOrder: Platform[] = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  helper,
  accent = "violet",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  helper?: string;
  accent?: "violet" | "indigo" | "blue" | "emerald" | "amber";
}) {
  const accentStyles = {
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-400 group-hover:border-violet-500/40",
    indigo: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 group-hover:border-indigo-500/40",
    blue: "border-sky-500/20 bg-sky-500/10 text-sky-400 group-hover:border-sky-500/40",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/40",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400 group-hover:border-amber-500/40",
  }[accent];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 p-5 backdrop-blur-xl shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#131324]/90">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${accentStyles}`}>
          <Icon size={18} />
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white/50">
          LIVE
        </span>
      </div>
      <div className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-xs font-semibold text-white/70">{label}</div>
      {helper && <div className="mt-1 text-[11px] text-white/40">{helper}</div>}
    </div>
  );
}

function EmptyChart({
  title = "No Engagement Data Yet",
  message = "Publish posts to your connected social channels to track real-time engagement rate over time.",
  actionHref,
  actionText,
}: {
  title?: string;
  message?: string;
  actionHref?: string;
  actionText?: string;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-6 py-12 text-center overflow-hidden">
      {/* Decorative subtle waveform */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg className="w-full h-32" viewBox="0 0 600 120" fill="none">
          <path
            d="M0,60 Q150,10 300,70 T600,40"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="text-violet-400"
          />
        </svg>
      </div>
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-400 shadow-sm mb-3">
        <BarChart3 size={22} />
      </div>
      <p className="relative z-10 text-sm font-semibold text-white/90">{title}</p>
      <p className="relative z-10 mt-1 max-w-sm text-xs text-white/50">{message}</p>
      {actionHref && (
        <Link
          href={actionHref}
          className="relative z-10 mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600/80 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-600 transition shadow-lg shadow-violet-600/20"
        >
          <PenSquare size={13} /> {actionText || "Get Started"}
        </Link>
      )}
    </div>
  );
}

function LineChart({ points }: { points: AnalyticsDashboardData["engagementOverTime"] }) {
  if (!points.length) {
    return (
      <EmptyChart
        title="No Engagement Trends Yet"
        message="Once you publish posts and track audience activity, your timeline will visualize engagement curves across dates."
        actionHref="/posts/new"
        actionText="Create & Publish Post"
      />
    );
  }

  const width = 700;
  const height = 250;
  const pad = 32;
  const max = Math.max(...points.map((p) => p.engagementRate), 1);
  const coords = points.map((point, index) => {
    const x = pad + (index / Math.max(points.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - (point.engagementRate / max) * (height - pad * 2);
    return { x, y, point };
  });

  const polyline = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M ${coords[0].x},${height - pad} ` +
    coords.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${coords[coords.length - 1].x},${height - pad} Z`;

  return (
    <div className="h-72 w-full overflow-hidden rounded-xl border border-white/[0.06] bg-black/40 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Engagement rate over time">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="rgba(255,255,255,0.08)" />
        <line x1={pad} y1={pad} x2={width - pad} y2={pad} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 5" />
        <line x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 5" />
        <path d={areaPath} fill="url(#chartGrad)" />
        <polyline points={polyline} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map(({ x, y, point }) => (
          <circle key={point.date} cx={x} cy={y} r="4" fill="#a78bfa" stroke="#07070f" strokeWidth="2">
            <title>{point.date}: {formatPercent(point.engagementRate)}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between px-2 text-[11px] text-white/40">
        <span>{points[0].date}</span>
        <span>{points[Math.floor(points.length / 2)]?.date}</span>
        <span>{points[points.length - 1].date}</span>
      </div>
    </div>
  );
}

function HorizontalBars({
  rows,
  label,
  value,
}: {
  rows: Array<{ name: string; value: number; helper: string }>;
  label: string;
  value: (v: number) => string;
}) {
  if (!rows.length) {
    return <EmptyChart title={`No ${label} Data`} message={`Publish content to see ${label.toLowerCase()} comparisons.`} />;
  }
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="space-y-5">
      {rows.map((row) => (
        <div key={row.name}>
          <div className="mb-2 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-white/90">{row.name}</div>
              <div className="mt-0.5 text-[11px] text-white/40">{row.helper}</div>
            </div>
            <div className="text-xs font-bold text-violet-400">{value(row.value)}</div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${Math.max(3, (row.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Filters({
  platform,
  setPlatform,
  category,
  setCategory,
  categories,
}: {
  platform: Platform | "ALL";
  setPlatform: (v: Platform | "ALL") => void;
  category: string;
  setCategory: (v: string) => void;
  categories: Array<{ id: string; name: string }>;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
        <Filter size={14} className="text-violet-400" /> Filters:
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform | "ALL")}
          className="h-9 rounded-xl border border-white/10 bg-[#16162a] px-3.5 text-xs font-medium text-white outline-none focus:border-violet-500 cursor-pointer"
        >
          <option value="ALL">All platforms</option>
          {platformOrder.map((p) => (
            <option key={p} value={p}>
              {platformLabels[p]}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 rounded-xl border border-white/10 bg-[#16162a] px-3.5 text-xs font-medium text-white outline-none focus:border-violet-500 cursor-pointer"
        >
          <option value="ALL">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function AnalyticsDashboard({
  initialData,
  categories,
  posts,
  initialPlatform = "ALL",
  initialCategory = "ALL",
}: {
  initialData: AnalyticsDashboardData;
  categories: Array<{ id: string; name: string }>;
  posts: Post[];
  initialPlatform?: Platform | "ALL";
  initialCategory?: string;
}) {
  const [platform, setPlatform] = useState<Platform | "ALL">(initialPlatform);
  const [category, setCategory] = useState(initialCategory);
  const router = useRouter();
  const [scorePostId, setScorePostId] = useState(posts[0]?.id || "");
  const [audience, setAudience] = useState("Young professionals and customers interested in modern brands");
  const [scoreResult, setScoreResult] = useState<{
    score: number;
    breakdown: Record<string, number>;
    recommendations: string[];
    provider: string;
  } | null>(null);
  const [scoreError, setScoreError] = useState("");
  const [isPending, startTransition] = useTransition();

  const data = initialData;

  function updateFilter(nextPlatform: Platform | "ALL", nextCategory: string) {
    const params = new URLSearchParams();
    if (nextPlatform !== "ALL") params.set("platform", nextPlatform);
    if (nextCategory !== "ALL") params.set("category", nextCategory);
    router.replace(`/analytics${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function handleScore() {
    if (!scorePostId) {
      setScoreError("Create or publish a post before scoring content.");
      return;
    }
    setScoreError("");
    setScoreResult(null);
    const formData = new FormData();
    formData.set("post_id", scorePostId);
    formData.set("target_audience", audience);
    startTransition(async () => {
      const result = await scorePostContent(formData);
      if (!result.ok) setScoreError(result.error);
      else {
        setScoreResult({
          score: result.score.score,
          breakdown: result.score.breakdown,
          recommendations: result.score.recommendations,
          provider: result.provider,
        });
      }
    });
  }

  const scorePost = posts.find((p) => p.id === scorePostId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <BarChart3 size={13} /> Performance intelligence
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-xs text-white/50">Analyze reach, track engagement rates, and score post effectiveness.</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/60 sm:self-auto">
          <Sparkles size={13} className="text-violet-400" /> Multi-Platform Metrics
        </div>
      </div>

      {/* Filter Bar */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 p-4 backdrop-blur-xl shadow-lg">
        <Filters
          platform={platform}
          setPlatform={(value) => {
            setPlatform(value);
            updateFilter(value, category);
          }}
          category={category}
          setCategory={(value) => {
            setCategory(value);
            updateFilter(platform, value);
          }}
          categories={categories}
        />
      </section>

      {/* Audience & Reach Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Audience & Reach Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Published Posts"
            value={formatNumber(initialData.summary.totalPublishedPosts)}
            icon={CheckCircle2}
            accent="violet"
            helper="Active published campaigns"
          />
          <MetricCard
            label="Total Reach"
            value={formatNumber(initialData.summary.reach)}
            icon={Users}
            accent="indigo"
            helper="Unique audience members"
          />
          <MetricCard
            label="Total Impressions"
            value={formatNumber(initialData.summary.impressions)}
            icon={BarChart3}
            accent="blue"
            helper="Total feed exposures"
          />
          <MetricCard
            label="Engagement Rate"
            value={formatPercent(initialData.summary.engagementRate)}
            icon={Gauge}
            accent="emerald"
            helper="Interactions ÷ reach"
          />
        </div>
      </div>

      {/* Interaction Volume */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Interaction Activity
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="Total Likes"
            value={formatNumber(initialData.summary.likes)}
            icon={TrendingUp}
            accent="violet"
            helper="Reactions & double-taps"
          />
          <MetricCard
            label="Total Comments"
            value={formatNumber(initialData.summary.comments)}
            icon={MessageCircle}
            accent="blue"
            helper="Discussions & feedback"
          />
          <MetricCard
            label="Total Shares"
            value={formatNumber(initialData.summary.shares)}
            icon={Share2}
            accent="indigo"
            helper="Retweets & story shares"
          />
        </div>
      </div>

      {/* Engagement Over Time */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <Activity size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Engagement Over Time</h2>
              <p className="text-[11px] text-white/50">Historical engagement rate trajectory across published content.</p>
            </div>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-white/50">
            {data.bestPosts.length ? "Filtered view" : "No matching posts"}
          </span>
        </div>
        <LineChart points={data.engagementOverTime} />
      </section>

      {/* Platform & Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="pb-3 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Platform Performance</h2>
            <p className="mt-0.5 text-[11px] text-white/50">Compare engagement efficiency by social network.</p>
          </div>
          <HorizontalBars
            label="platform"
            rows={data.platformPerformance.map((row) => ({
              name: platformLabels[row.platform],
              value: row.engagementRate,
              helper: `${row.posts} published · ${formatNumber(row.reach)} reach`,
            }))}
            value={formatPercent}
          />
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="pb-3 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Category Performance</h2>
            <p className="mt-0.5 text-[11px] text-white/50">See which content themes resonate strongest with your audience.</p>
          </div>
          <HorizontalBars
            label="category"
            rows={data.categoryPerformance.map((row) => ({
              name: row.categoryName,
              value: row.engagementRate,
              helper: `${row.posts} published · ${formatNumber(row.reach)} reach`,
            }))}
            value={formatPercent}
          />
        </section>
      </div>

      {/* Best Performing Content */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Top Performing Content</h2>
            <p className="mt-0.5 text-[11px] text-white/50">Published posts ranked by highest engagement rate.</p>
          </div>
          <TrendingUp size={18} className="text-violet-400" />
        </div>
        {data.bestPosts.length === 0 ? (
          <div className="px-6 py-12 text-center text-xs text-white/40">
            No published posts match these filters.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {data.bestPosts.map((post, index) => (
              <div
                key={post.id}
                className="grid gap-4 px-6 py-4 md:grid-cols-[36px_1fr_130px_140px] md:items-center hover:bg-white/[0.02] transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-xs font-bold text-violet-300">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-violet-400">{platformShort[post.platform]}</span>
                    <span className="text-xs text-white/40">· {post.categoryName}</span>
                  </div>
                  <div className="mt-1 truncate text-xs font-semibold text-white/90">{post.title}</div>
                  <div className="mt-0.5 truncate text-[11px] text-white/40">{post.caption || "No caption"}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-400">{formatPercent(post.engagementRate)}</div>
                  <div className="text-[10px] uppercase font-semibold text-white/40">engagement</div>
                </div>
                <div className="text-xs leading-relaxed text-white/60">
                  {formatNumber(post.likes)} likes<br />
                  {formatNumber(post.reach)} reach
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Content Intelligence Scoring */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Content Intelligence & Scoring</h2>
              <p className="text-[11px] text-white/50">Score a post from 0–100 using AI readability and engagement metrics.</p>
            </div>
          </div>
          {scoreResult && (
            <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
              {scoreResult.provider.startsWith("mock") ? "Demo Mode" : `API · ${scoreResult.provider}`}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-7 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div>
              <label htmlFor="score-post" className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                Select Post
              </label>
              <select
                id="score-post"
                value={scorePostId}
                onChange={(e) => setScorePostId(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="">Choose a post to score</option>
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="score-audience" className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                Target Audience
              </label>
              <input
                id="score-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                maxLength={300}
                placeholder="Describe your ideal audience..."
                className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 text-xs text-white outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="button"
              onClick={handleScore}
              disabled={isPending || !scorePostId}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Scoring Content…
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Score Content
                </>
              )}
            </button>
            {scoreError && <p className="text-xs font-medium text-rose-400">{scoreError}</p>}
          </div>

          {!scoreResult ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-6 py-8 text-center">
              <div>
                <Gauge size={26} className="mx-auto text-white/30" />
                <p className="mt-2.5 text-xs font-semibold text-white/70">No score evaluated yet</p>
                <p className="mt-1 max-w-xs text-[11px] text-white/40">
                  Select a post from the dropdown and click Score Content to analyze hook strength, readability, and CTA quality.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[160px_1fr]">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-indigo-500/10 p-5 text-center shadow-lg">
                <div className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300">
                  {scoreResult.score}
                </div>
                <div className="mt-1 text-xs font-medium text-white/50">/ 100</div>
                <div className="mt-3 text-xs font-semibold text-violet-400">Content Score</div>
              </div>
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ScoreBar label="Hook strength" value={scoreResult.breakdown.hookStrength} />
                  <ScoreBar label="Readability" value={scoreResult.breakdown.readability} />
                  <ScoreBar label="CTA strength" value={scoreResult.breakdown.ctaStrength} />
                  <ScoreBar label="Platform fit" value={scoreResult.breakdown.platformSuitability} />
                  <ScoreBar label="Audience relevance" value={scoreResult.breakdown.audienceRelevance} />
                  <ScoreBar label="Hashtag quality" value={scoreResult.breakdown.hashtagQuality} />
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Recommendations</div>
                  <ul className="mt-2.5 space-y-2">
                    {scoreResult.recommendations.map((recommendation, i) => (
                      <li key={`${recommendation}-${i}`} className="flex gap-2 text-xs text-white/70">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        {scorePost && <p className="mt-4 text-xs text-white/40">Scored post: {scorePost.title}</p>}
      </section>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs font-medium text-white/60">
        <span>{label}</span>
        <span className="text-white/80">{Math.round(value)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
