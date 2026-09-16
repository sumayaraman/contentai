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
  X: "X (Twitter)",
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
  const accentColor = {
    violet: "#a89dff",
    indigo: "#818cf8",
    blue: "#60a5fa",
    emerald: "#34d399",
    amber: "#fbbf24",
  }[accent];

  const accentBg = {
    violet: "rgba(109,92,255,0.12)",
    indigo: "rgba(99,102,241,0.12)",
    blue: "rgba(59,130,246,0.12)",
    emerald: "rgba(16,185,129,0.12)",
    amber: "rgba(245,158,11,0.12)",
  }[accent];

  const accentBorder = {
    violet: "rgba(109,92,255,0.25)",
    indigo: "rgba(99,102,241,0.25)",
    blue: "rgba(59,130,246,0.25)",
    emerald: "rgba(16,185,129,0.25)",
    amber: "rgba(245,158,11,0.25)",
  }[accent];

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        transition: "border-color 0.15s ease, transform 0.15s ease",
      }}
      className="hover:-translate-y-0.5 hover:border-violet-500/30"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "var(--r-md)",
            background: accentBg,
            border: `1px solid ${accentBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accentColor,
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 99,
            padding: "2px 8px",
          }}
        >
          LIVE
        </span>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          {value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginTop: 3 }}>
          {label}
        </div>
        {helper && (
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
            {helper}
          </div>
        )}
      </div>
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--r-lg)",
        border: "1px dashed var(--border)",
        background: "rgba(255,255,255,0.01)",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "var(--r-md)",
          background: "var(--accent-soft)",
          border: "1px solid var(--border-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a89dff",
          marginBottom: 14,
        }}
      >
        <BarChart3 size={24} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</p>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 360, margin: "6px 0 0", lineHeight: 1.5 }}>
        {message}
      </p>
      {actionHref && (
        <Link
          href={actionHref}
          className="btn btn-primary btn-sm"
          style={{ marginTop: 16, gap: 6 }}
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
  const areaPath =
    `M ${coords[0].x},${height - pad} ` +
    coords.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${coords[coords.length - 1].x},${height - pad} Z`;

  return (
    <div
      style={{
        height: 280,
        width: "100%",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-elevated)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%" }} role="img" aria-label="Engagement rate over time">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="rgba(255,255,255,0.08)" />
        <line x1={pad} y1={pad} x2={width - pad} y2={pad} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 5" />
        <line x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 5" />
        <path d={areaPath} fill="url(#chartGrad)" />
        <polyline points={polyline} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map(({ x, y, point }) => (
          <circle key={point.date} cx={x} cy={y} r="4" fill="#a78bfa" stroke="#07070f" strokeWidth="2">
            <title>{point.date}: {formatPercent(point.engagementRate)}</title>
          </circle>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px", fontSize: 11, color: "var(--text-muted)" }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {rows.map((row) => (
        <div key={row.name}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {row.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{row.helper}</div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)" }}>{value(row.value)}</div>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                background: "linear-gradient(90deg, #6d5cff 0%, #a855f7 100%)",
                width: `${Math.max(3, (row.value / max) * 100)}%`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      ))}
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
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Filter Bar with Campaign Panel styling */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: "16px 22px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--r-md)",
              background: "var(--accent-soft)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a89dff",
            }}
          >
            <Filter size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Filter Metrics</div>
            <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Slice data by platform and content category</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select
            value={platform}
            onChange={(e) => {
              const nextVal = e.target.value as Platform | "ALL";
              setPlatform(nextVal);
              updateFilter(nextVal, category);
            }}
            className="campaign-input"
            style={{ height: 38, width: "auto", minWidth: 140, cursor: "pointer" }}
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
            onChange={(e) => {
              const nextVal = e.target.value;
              setCategory(nextVal);
              updateFilter(platform, nextVal);
            }}
            className="campaign-input"
            style={{ height: 38, width: "auto", minWidth: 150, cursor: "pointer" }}
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

      {/* Audience & Reach Overview */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
            Audience Overview
          </span>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
            Audience &amp; Reach Overview
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
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

      {/* Interaction Activity */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
            Engagement Breakdown
          </span>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
            Interaction Activity
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
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

      {/* Engagement Over Time Card */}
      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: 24,
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            paddingBottom: 14,
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--r-md)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
              }}
            >
              <Activity size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                Engagement Over Time
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Historical engagement rate trajectory across published content
              </p>
            </div>
          </div>
          <span className="badge badge-ai" style={{ fontSize: 11 }}>
            {data.bestPosts.length ? "Filtered View" : "No Matching Posts"}
          </span>
        </div>
        <LineChart points={data.engagementOverTime} />
      </section>

      {/* Platform & Category Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
        <section
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Networks
            </span>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
              Platform Performance
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
              Compare engagement efficiency by social network
            </p>
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

        <section
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border-subtle)" }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Topics
            </span>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
              Category Performance
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
              See which content themes resonate strongest with your audience
            </p>
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

      {/* Top Performing Content */}
      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Leaderboard
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
              Top Performing Content
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
              Published posts ranked by highest engagement rate
            </p>
          </div>
          <TrendingUp size={18} style={{ color: "var(--accent)" }} />
        </div>

        {data.bestPosts.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
            No published posts match these filters.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.bestPosts.map((post, index) => (
              <div
                key={post.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px 1fr 130px 140px",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background 0.15s ease",
                }}
                className="hover:bg-white/[0.02]"
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--r-sm)",
                    background: "var(--accent-soft)",
                    border: "1px solid var(--border-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#a89dff",
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent)" }}>
                      {platformShort[post.platform]}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {post.categoryName}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {post.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {post.caption || "No caption"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#34d399" }}>
                    {formatPercent(post.engagementRate)}
                  </div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 600, color: "var(--text-muted)", marginTop: 1 }}>
                    engagement
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {formatNumber(post.likes)} likes<br />
                  {formatNumber(post.reach)} reach
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Content Intelligence Scoring */}
      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: 24,
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
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
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                AI Scoring Studio
              </span>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", margin: "2px 0 0" }}>
                Content Intelligence &amp; Scoring
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Score a post from 0–100 using AI readability and engagement metrics
              </p>
            </div>
          </div>
          {scoreResult && (
            <span className="badge badge-ai" style={{ fontSize: 11 }}>
              {scoreResult.provider.startsWith("mock") ? "Demo Mode" : `AI · ${scoreResult.provider}`}
            </span>
          )}
        </div>

        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {/* Left Form Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div className="campaign-field-label">
                <span>Select Post</span>
              </div>
              <select
                id="score-post"
                value={scorePostId}
                onChange={(e) => setScorePostId(e.target.value)}
                className="campaign-input"
                style={{ height: 40 }}
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
              <div className="campaign-field-label">
                <span>Target Audience</span>
              </div>
              <input
                id="score-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                maxLength={300}
                placeholder="Describe your ideal audience..."
                className="campaign-input"
                style={{ height: 40 }}
              />
            </div>

            <button
              type="button"
              onClick={handleScore}
              disabled={isPending || !scorePostId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: "var(--r-md)",
                background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
                padding: "12px 20px",
                fontSize: 13,
                fontWeight: 700,
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(109,92,255,0.35)",
                opacity: isPending || !scorePostId ? 0.6 : 1,
                marginTop: 4,
              }}
            >
              {isPending ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Scoring Content…
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Score Content
                </>
              )}
            </button>
            {scoreError && <p style={{ fontSize: 12, fontWeight: 600, color: "#f87171", margin: 0 }}>{scoreError}</p>}
          </div>

          {/* Right Result Stage */}
          {!scoreResult ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--r-lg)",
                border: "1px dashed var(--border)",
                background: "rgba(255,255,255,0.01)",
                padding: "36px 24px",
                textAlign: "center",
                minHeight: 220,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--r-md)",
                  background: "var(--accent-soft)",
                  border: "1px solid var(--border-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a89dff",
                  marginBottom: 12,
                }}
              >
                <Gauge size={22} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                No score evaluated yet
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 300, margin: "6px 0 0", lineHeight: 1.5 }}>
                Select a post from the dropdown and click Score Content to analyze hook strength, readability, and CTA quality.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--r-lg)",
                  border: "1px solid var(--border-accent)",
                  background: "linear-gradient(180deg, rgba(109,92,255,0.12) 0%, rgba(168,85,247,0.08) 100%)",
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.03em" }}>
                  {scoreResult.score}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>/ 100</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", marginTop: 8 }}>
                  Content Score
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <ScoreBar label="Hook strength" value={scoreResult.breakdown.hookStrength} />
                  <ScoreBar label="Readability" value={scoreResult.breakdown.readability} />
                  <ScoreBar label="CTA strength" value={scoreResult.breakdown.ctaStrength} />
                  <ScoreBar label="Platform fit" value={scoreResult.breakdown.platformSuitability} />
                  <ScoreBar label="Audience relevance" value={scoreResult.breakdown.audienceRelevance} />
                  <ScoreBar label="Hashtag quality" value={scoreResult.breakdown.hashtagQuality} />
                </div>

                <div
                  style={{
                    borderRadius: "var(--r-md)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-elevated)",
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
                    Recommendations
                  </div>
                  <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {scoreResult.recommendations.map((recommendation, i) => (
                      <li key={`${recommendation}-${i}`} style={{ display: "flex", gap: 6, fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        {scorePost && (
          <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "14px 0 0" }}>
            Scored post: <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{scorePost.title}</span>
          </p>
        )}
      </section>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: "var(--text-primary)" }}>{Math.round(value)}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            background: "linear-gradient(90deg, #6d5cff 0%, #a855f7 100%)",
            width: `${Math.max(2, Math.min(100, value))}%`,
          }}
        />
      </div>
    </div>
  );
}
