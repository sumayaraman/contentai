"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CheckCircle2, Filter, Gauge, MessageCircle, RefreshCw, Share2, Sparkles, TrendingUp, Users } from "lucide-react";
import { scorePostContent } from "@/lib/analytics/actions";
import type { AnalyticsDashboardData } from "@/lib/analytics/types";
import type { Platform, Post } from "@/types/database";

const platformLabels: Record<Platform, string> = { INSTAGRAM: "Instagram", FACEBOOK: "Facebook", LINKEDIN: "LinkedIn", X: "X" };
const platformShort: Record<Platform, string> = { INSTAGRAM: "IG", FACEBOOK: "FB", LINKEDIN: "IN", X: "X" };
const platformOrder: Platform[] = ["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}
function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function MetricCard({ label, value, icon: Icon, helper }: { label: string; value: string; icon: typeof TrendingUp; helper?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-5 backdrop-blur-xl shadow-lg transition hover:border-violet-500/30 hover:bg-[#131322]/90">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400 transition group-hover:scale-105">
          <Icon size={18} />
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white/50">
          LIVE
        </span>
      </div>
      <div className="mt-5 text-2xl font-bold tracking-tight text-white">{value}</div>
      <div className="mt-1.5 text-xs font-medium text-white/60">{label}</div>
      {helper && <div className="mt-2 text-[11px] text-white/40">{helper}</div>}
    </div>
  );
}

function LineChart({ points }: { points: AnalyticsDashboardData["engagementOverTime"] }) {
  if (!points.length) return <EmptyChart message="Publish posts to see engagement over time." />;
  const width = 700, height = 250, pad = 32;
  const max = Math.max(...points.map((p) => p.engagementRate), 1);
  const coords = points.map((point, index) => {
    const x = pad + (index / Math.max(points.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - (point.engagementRate / max) * (height - pad * 2);
    return { x, y, point };
  });
  const polyline = coords.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <div className="h-72 w-full overflow-hidden rounded-xl border border-white/[0.06] bg-black/40 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Engagement rate over time">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="rgba(255,255,255,0.08)" />
        <line x1={pad} y1={pad} x2={width - pad} y2={pad} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 5" />
        <line x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 5" />
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

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-xs text-white/40">
      {message}
    </div>
  );
}

function HorizontalBars({ rows, label, value }: { rows: Array<{ name: string; value: number; helper: string }>; label: string; value: (v: number) => string }) {
  if (!rows.length) return <EmptyChart message={`No ${label.toLowerCase()} data yet.`} />;
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="space-y-6">
      {rows.map((row) => (
        <div key={row.name}>
          <div className="mb-2.5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white/90">{row.name}</div>
              <div className="mt-0.5 text-xs text-white/40">{row.helper}</div>
            </div>
            <div className="text-sm font-semibold text-violet-400">{value(row.value)}</div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${Math.max(3, (row.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Filters({ platform, setPlatform, category, setCategory, categories }: { platform: Platform | "ALL"; setPlatform: (v: Platform | "ALL") => void; category: string; setCategory: (v: string) => void; categories: Array<{ id: string; name: string }> }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
        <Filter size={14} className="text-violet-400" /> Filters:
      </div>
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value as Platform | "ALL")}
        className="rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2 text-xs font-medium text-white outline-none focus:border-violet-500 cursor-pointer"
      >
        <option value="ALL">All platforms</option>
        {platformOrder.map((p) => <option key={p} value={p}>{platformLabels[p]}</option>)}
      </select>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2 text-xs font-medium text-white outline-none focus:border-violet-500 cursor-pointer"
      >
        <option value="ALL">All categories</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  );
}

export function AnalyticsDashboard({ initialData, categories, posts, initialPlatform = "ALL", initialCategory = "ALL" }: { initialData: AnalyticsDashboardData; categories: Array<{ id: string; name: string }>; posts: Post[]; initialPlatform?: Platform | "ALL"; initialCategory?: string }) {
  const [platform, setPlatform] = useState<Platform | "ALL">(initialPlatform);
  const [category, setCategory] = useState(initialCategory);
  const router = useRouter();
  const [scorePostId, setScorePostId] = useState(posts[0]?.id || "");
  const [audience, setAudience] = useState("Young professionals and customers interested in modern brands");
  const [scoreResult, setScoreResult] = useState<{ score: number; breakdown: Record<string, number>; recommendations: string[]; provider: string } | null>(null);
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
    if (!scorePostId) { setScoreError("Create or publish a post before scoring content."); return; }
    setScoreError(""); setScoreResult(null);
    const formData = new FormData(); formData.set("post_id", scorePostId); formData.set("target_audience", audience);
    startTransition(async () => {
      const result = await scorePostContent(formData);
      if (!result.ok) setScoreError(result.error);
      else setScoreResult({ score: result.score.score, breakdown: result.score.breakdown, recommendations: result.score.recommendations, provider: result.provider });
    });
  }

  const scorePost = posts.find((p) => p.id === scorePostId);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <BarChart3 size={13} /> Performance intelligence
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-white/50">Understand what is resonating and improve your next piece of content.</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 sm:self-auto">
          <Sparkles size={13} className="text-violet-400" /> Multi-Platform Metrics
        </div>
      </div>

      {/* Filter Bar */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-4 backdrop-blur-xl shadow-sm">
        <Filters
          platform={platform}
          setPlatform={(value) => { setPlatform(value); updateFilter(value, category); }}
          category={category}
          setCategory={(value) => { setCategory(value); updateFilter(platform, value); }}
          categories={categories}
        />
      </section>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Published Posts" value={formatNumber(initialData.summary.totalPublishedPosts)} icon={CheckCircle2} />
        <MetricCard label="Likes" value={formatNumber(initialData.summary.likes)} icon={TrendingUp} />
        <MetricCard label="Comments" value={formatNumber(initialData.summary.comments)} icon={MessageCircle} />
        <MetricCard label="Shares" value={formatNumber(initialData.summary.shares)} icon={Share2} />
      </div>

      {/* Reach & Engagement */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Reach" value={formatNumber(initialData.summary.reach)} icon={Users} />
        <MetricCard label="Impressions" value={formatNumber(initialData.summary.impressions)} icon={BarChart3} />
        <MetricCard label="Engagement Rate" value={formatPercent(initialData.summary.engagementRate)} icon={Gauge} helper="Interactions ÷ reach" />
      </div>

      {/* Engagement Over Time */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-5 backdrop-blur-xl shadow-lg sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Engagement Over Time</h2>
            <p className="mt-1 text-xs text-white/50">Engagement rate across published content.</p>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/50">
            {data.bestPosts.length ? "Filtered view" : "No matching posts"}
          </span>
        </div>
        <LineChart points={data.engagementOverTime} />
      </section>

      {/* Platform & Category Breakdown */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-5 backdrop-blur-xl shadow-lg sm:p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-white">Platform Performance</h2>
            <p className="mt-1 text-xs text-white/50">Compare engagement by platform.</p>
          </div>
          <HorizontalBars label="platform" rows={data.platformPerformance.map((row) => ({ name: platformLabels[row.platform], value: row.engagementRate, helper: `${row.posts} published · ${formatNumber(row.reach)} reach` }))} value={formatPercent} />
        </section>
        <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-5 backdrop-blur-xl shadow-lg sm:p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-white">Category Performance</h2>
            <p className="mt-1 text-xs text-white/50">See which content themes perform best.</p>
          </div>
          <HorizontalBars label="category" rows={data.categoryPerformance.map((row) => ({ name: row.categoryName, value: row.engagementRate, helper: `${row.posts} published · ${formatNumber(row.reach)} reach` }))} value={formatPercent} />
        </section>
      </div>

      {/* Best Performing Content */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold text-white">Best Performing Content</h2>
            <p className="mt-1 text-xs text-white/50">Top published posts ranked by engagement rate.</p>
          </div>
          <TrendingUp size={18} className="text-violet-400" />
        </div>
        {data.bestPosts.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-white/40 sm:px-6">No published posts match these filters.</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {data.bestPosts.map((post, index) => (
              <div key={post.id} className="grid gap-4 px-5 py-4 sm:px-6 md:grid-cols-[32px_1fr_120px_130px] md:items-center hover:bg-white/[0.02] transition">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-xs font-bold text-violet-300">{index + 1}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="text-xs font-semibold text-violet-400">{platformShort[post.platform]}</span><span className="text-xs text-white/40">· {post.categoryName}</span></div>
                  <div className="mt-1 truncate font-medium text-white/90">{post.title}</div>
                  <div className="mt-0.5 truncate text-xs text-white/40">{post.caption || "No caption"}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-400">{formatPercent(post.engagementRate)}</div>
                  <div className="text-[11px] text-white/40">engagement</div>
                </div>
                <div className="text-xs leading-relaxed text-white/60">{formatNumber(post.likes)} likes<br />{formatNumber(post.reach)} reach</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Content Intelligence Scoring */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-5 backdrop-blur-xl shadow-lg sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Content Intelligence</h2>
              <p className="mt-1 text-xs text-white/50">Score a post from 0–100 using AI or automated readability metrics.</p>
            </div>
          </div>
          {scoreResult && (
            <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
              {scoreResult.provider.startsWith("mock") ? "Demo Mode" : `API · ${scoreResult.provider}`}
            </div>
          )}
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-white/70">
              Post
              <select
                value={scorePostId}
                onChange={(e) => setScorePostId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#16162a] px-3 py-2.5 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="">Choose a post</option>
                {posts.map((post) => <option key={post.id} value={post.id}>{post.title}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-white/70">
              Target audience
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                maxLength={300}
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#16162a] px-3 py-2.5 text-xs text-white outline-none focus:border-violet-500"
              />
            </label>
            <button
              type="button"
              onClick={handleScore}
              disabled={isPending || !scorePostId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {isPending ? <><RefreshCw size={14} className="animate-spin" /> Scoring…</> : <><Sparkles size={14} /> Score Content</>}
            </button>
            {scoreError && <p className="text-xs font-medium text-rose-400">{scoreError}</p>}
          </div>

          {!scoreResult ? (
            <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-8 text-center">
              <div>
                <Gauge size={24} className="mx-auto text-white/30" />
                <p className="mt-2 text-xs font-semibold text-white/70">No score yet</p>
                <p className="mt-1 text-[11px] text-white/40">Select a post and score it to see strengths and recommendations.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[150px_1fr]">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-indigo-500/10 p-5 text-center">
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
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

