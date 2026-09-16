"use client";

import { useState, useEffect } from "react";
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
  BarChart3,
  CalendarDays,
  Image as ImageIcon,
  Megaphone,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";

function getGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Good night";
}

function MetricCard({ label, value, change, trend, accent }: {
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

export default function DashboardPage() {
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    // Re-evaluate on client mount according to user's local regional time
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

  const featureCards = [
    {
      title: "AI Content",
      badge: "✨ Instant Copy",
      badgeColor: "#a89dff",
      badgeBg: "rgba(109,92,255,0.12)",
      badgeBorder: "rgba(109,92,255,0.25)",
      icon: Sparkles,
      iconColor: "#a89dff",
      iconBg: "rgba(109,92,255,0.12)",
      iconBorder: "rgba(109,92,255,0.25)",
      description: "Create captions, hooks, CTAs and hashtags with AI tailored for every social channel.",
      cta: "Create Content →",
      href: "/ai-studio",
    },
    {
      title: "Image & Video Generator",
      badge: "🎨 Visual Studio",
      badgeColor: "#f472b6",
      badgeBg: "rgba(244,114,182,0.12)",
      badgeBorder: "rgba(244,114,182,0.25)",
      icon: ImageIcon,
      iconColor: "#f472b6",
      iconBg: "rgba(244,114,182,0.12)",
      iconBorder: "rgba(244,114,182,0.25)",
      description: "Create a custom image or video visual for your individual social media posts.",
      cta: "Create Visual →",
      href: "/image-studio",
    },
    {
      title: "30-Day Content Workshop",
      badge: "📅 Month Plan",
      badgeColor: "#fbbf24",
      badgeBg: "rgba(245,158,11,0.12)",
      badgeBorder: "rgba(245,158,11,0.25)",
      icon: WandSparkles,
      iconColor: "#fbbf24",
      iconBg: "rgba(245,158,11,0.12)",
      iconBorder: "rgba(245,158,11,0.25)",
      description: "Generate a complete month of branded visual content with your logo, watermark, and schedule.",
      cta: "Open Workshop →",
      href: "/workspace",
    },
    {
      title: "Content Calendar",
      badge: "📅 Schedule",
      badgeColor: "#60a5fa",
      badgeBg: "rgba(59,130,246,0.12)",
      badgeBorder: "rgba(59,130,246,0.25)",
      icon: CalendarDays,
      iconColor: "#60a5fa",
      iconBg: "rgba(59,130,246,0.12)",
      iconBorder: "rgba(59,130,246,0.25)",
      description: "Plan and schedule your upcoming social media content across all connected channels.",
      cta: "Open Calendar →",
      href: "/calendar",
    },
    {
      title: "Campaigns",
      badge: "🚀 Goal Focused",
      badgeColor: "#818cf8",
      badgeBg: "rgba(129,140,248,0.12)",
      badgeBorder: "rgba(129,140,248,0.25)",
      icon: Megaphone,
      iconColor: "#818cf8",
      iconBg: "rgba(129,140,248,0.12)",
      iconBorder: "rgba(129,140,248,0.25)",
      description: "Organize multiple posts around one marketing goal, launch, or event.",
      cta: "View Campaigns →",
      href: "/campaigns",
    },
    {
      title: "Analytics",
      badge: "📊 Insights",
      badgeColor: "#34d399",
      badgeBg: "rgba(16,185,129,0.12)",
      badgeBorder: "rgba(16,185,129,0.25)",
      icon: BarChart3,
      iconColor: "#34d399",
      iconBg: "rgba(16,185,129,0.12)",
      iconBorder: "rgba(16,185,129,0.25)",
      description: "Understand what content is performing, review engagement, and score post quality.",
      cta: "View Analytics →",
      href: "/analytics",
    },
  ];

  return (
    <div className="page animate-fade-in">
      {/* 1. Hero Welcome Section */}
      <div
        className="card"
        style={{
          marginBottom: 20,
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(109,92,255,0.10) 0%, rgba(168,85,247,0.05) 100%), var(--bg-surface)",
          border: "1px solid var(--border-accent)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              background: "var(--accent-soft)",
              border: "1px solid var(--border-accent)",
              padding: "3px 10px",
              borderRadius: "var(--r-full)",
            }}
          >
            {greeting} ✦
          </span>
        </div>

        <div>
          <h1
            style={{
              fontSize: "clamp(20px, 3vw, 26px)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Create better social content with AI.
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              margin: "6px 0 0",
              maxWidth: 640,
            }}
          >
            Create, organize, schedule, and analyze your social media content — all in one place.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
          <Link
            href="/create"
            className="btn btn-primary"
            style={{
              height: 40,
              padding: "0 18px",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Sparkles size={14} />
            <span>✨ Create Content</span>
          </Link>
          <Link
            href="/ai-assistant"
            className="btn btn-secondary"
            style={{
              height: 40,
              padding: "0 18px",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              borderRadius: "var(--r-md)",
            }}
          >
            <Bot size={14} />
            <span>🤖 Ask AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* 2. What would you like to do? Section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              What would you like to do?
            </h2>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "2px 0 0" }}>
              Explore the core creation, planning, and analytics capabilities of ContentAI.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {featureCards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="card"
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-xl)",
                  transition: "border-color 0.15s ease, transform 0.15s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--r-md)",
                        background: c.iconBg,
                        border: `1px solid ${c.iconBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: c.iconColor,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: c.badgeColor,
                        background: c.badgeBg,
                        border: `1px solid ${c.badgeBorder}`,
                        padding: "2px 8px",
                        borderRadius: "var(--r-full)",
                      }}
                    >
                      {c.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.45 }}>
                    {c.description}
                  </p>
                </div>
                <div style={{ marginTop: 14 }}>
                  <Link
                    href={c.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--accent)",
                      textDecoration: "none",
                    }}
                  >
                    <span>{c.cta}</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: 20 }}>
        {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
      </div>

      <div className="card" style={{ marginBottom: 20, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Zap size={13} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Content Pipeline</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {pipeline.map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: step.color, letterSpacing: "-0.03em" }}>{step.count}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>{step.label}</div>
              </div>
              {i < pipeline.length - 1 && <ArrowRight size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-h">
            <span className="card-title">Recent content</span>
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
                    <td><span style={{ display: "block", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 450 }}>{p.title}</span></td>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="card-title">Content Performance</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>This Week</span>
            </div>
            <PerformanceChart />
          </div>

          <AIAssistant />

          <div className="card">
            <div className="card-h">
              <span className="card-title">Approval Queue</span>
              <Link href="/posts?status=review" className="btn btn-ghost btn-sm" style={{ fontSize: 11.5 }}>View all</Link>
            </div>
            <div style={{ padding: "6px 10px" }}>
              {approvalQueue.map((item) => (
                <div key={item.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 6px", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{item.platform} · {item.time}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 10 }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--green-soft)", color: "var(--green)" }}><Check size={12} /></span>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--red-soft)", color: "var(--red)" }}><X size={12} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h"><span className="card-title">Quick actions</span></div>
            <div style={{ padding: "8px 10px" }}>
              {[
                { icon: Plus, label: "New post", href: "/posts/new" },
                { icon: Sparkles, label: "AI Studio", href: "/ai-studio" },
                { icon: Clock, label: "Schedule content", href: "/calendar" },
                { icon: CheckCircle2, label: "Review drafts", href: "/posts?status=draft" },
              ].map(({ icon: Icon, label, href }) => (
                <Link key={href} href={href} className="sb-link" style={{ marginBottom: 0 }}>
                  <Icon size={13} style={{ color: "var(--text-muted)" }} /> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
