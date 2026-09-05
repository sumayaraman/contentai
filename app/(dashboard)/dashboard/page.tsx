import { Sparkles, TrendingUp, TrendingDown, Plus, ArrowRight, Clock, CheckCircle2, Zap, Bot, Check, X, Send } from "lucide-react";
import Link from "next/link";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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
    published: "badge badge-success",
    live: "badge badge-success",
    scheduled: "badge badge-info",
    draft: "badge badge-muted",
    error: "badge badge-error",
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

/** Multi-series performance chart (Reach / Engagement / Clicks) — pure SVG, no chart lib needed */
function PerformanceChart() {
  const days = ["May 19", "May 20", "May 21", "May 22", "May 23", "May 24", "May 25"];
  const series = [
    { name: "Reach",      color: "var(--accent)", values: [40, 55, 48, 70, 65, 90, 100] },
    { name: "Engagement", color: "var(--purple)",  values: [20, 30, 35, 40, 38, 55, 62] },
    { name: "Clicks",     color: "var(--blue)",    values: [10, 14, 12, 22, 18, 30, 34] },
  ];
  const w = 560, h = 160, pad = 8;
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
          <span key={d} style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.split(" ")[1]}</span>
        ))}
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

export default async function DashboardPage() {
  const metrics = [
    { label: "Total Posts",     value: "142",  change: "+12 this month",    trend: "up"   as const, accent: true },
    { label: "Scheduled",       value: "23",   change: "Next 7 days",       trend: "flat" as const },
    { label: "Published",       value: "118",  change: "+8 vs last month",  trend: "up"   as const },
    { label: "Avg. Engagement", value: "4.2%", change: "–0.3%",             trend: "down" as const },
  ];

  const recentPosts = [
    { title: "5 AI tools every creator needs in 2025", platform: "LinkedIn",  status: "published", date: "Apr 9"  },
    { title: "Behind the scenes: our content process",  platform: "Instagram", status: "scheduled", date: "Apr 11" },
    { title: "Thread: How we grew to 10k followers",    platform: "Twitter",   status: "draft",     date: "—"      },
    { title: "Monthly roundup: March highlights",       platform: "LinkedIn",  status: "published", date: "Apr 1"  },
  ];

  const pipeline = [
    { label: "Idea",        count: 18, color: "var(--text-muted)" },
    { label: "In Progress", count: 12, color: "var(--amber)" },
    { label: "Review",      count: 7,  color: "var(--blue)" },
    { label: "Approved",    count: 24, color: "var(--accent)" },
    { label: "Scheduled",   count: 24, color: "var(--green)" },
  ];

  const aiSuggestions = [
    "Carousel: 5 productivity hacks for marketers",
    "Reel: Day in the life of a creative team",
    "Post: Industry insight with a strong hook",
  ];

  const approvalQueue = [
    { title: "New Project Spotlight", platform: "Facebook", time: "May 23, 10:30 AM" },
    { title: "5 Content Tips That Actually Work", platform: "LinkedIn", time: "May 23, 03:00 PM" },
  ];

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{getGreeting()} ✦</h1>
          <p className="page-subtitle">Here's what's happening with your content today.</p>
        </div>
        <Link href="/ai-studio" className="btn btn-ai">
          <Sparkles size={13} />
          Create with AI
        </Link>
      </div>

      {/* Metrics */}
      <div className="metrics-grid" style={{ marginBottom: 20 }}>
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Content Pipeline */}
      <div className="card" style={{ marginBottom: 20, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Zap size={13} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Content Pipeline</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {pipeline.map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: step.color, letterSpacing: "-0.03em" }}>
                  {step.count}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>{step.label}</div>
              </div>
              {i < pipeline.length - 1 && (
                <ArrowRight size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

        {/* Recent posts */}
        <div className="card">
          <div className="card-h">
            <span className="card-title">Recent content</span>
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
                      <span style={{
                        display: "block", maxWidth: 260,
                        overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap", fontWeight: 450
                      }}>
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

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Content Performance */}
          <div className="card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="card-title">Content Performance</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>This Week</span>
            </div>
            <PerformanceChart />
          </div>

          {/* AI Assistant */}
          <div className="ai-card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <Bot size={13} style={{ color: "var(--accent)" }} />
              <span className="ai-tag">AI Assistant</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>
              Here are some content ideas for this week designed for higher engagement:
            </p>
            <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {aiSuggestions.map((s) => (
                <li key={s} style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.5 }}>{s}</li>
              ))}
            </ul>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <input
                placeholder="Ask AI anything..."
                readOnly
                style={{
                  flex: 1, background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)", padding: "8px 10px", fontSize: 12,
                  color: "var(--text-primary)", outline: "none",
                }}
              />
              <button className="btn btn-primary btn-sm" style={{ padding: "8px 10px" }} aria-label="Send">
                <Send size={13} />
              </button>
            </div>
          </div>

          {/* Approval Queue */}
          <div className="card">
            <div className="card-h">
              <span className="card-title">Approval Queue</span>
              <Link href="/posts?status=review" className="btn btn-ghost btn-sm" style={{ fontSize: 11.5 }}>
                View all
              </Link>
            </div>
            <div style={{ padding: "6px 10px" }}>
              {approvalQueue.map((item) => (
                <div key={item.title} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 6px", borderBottom: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {item.platform} · {item.time}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 10 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      background: "var(--green-soft)", color: "var(--green)",
                    }}>
                      <Check size={12} />
                    </span>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      background: "var(--red-soft)", color: "var(--red)",
                    }}>
                      <X size={12} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-h">
              <span className="card-title">Quick actions</span>
            </div>
            <div style={{ padding: "8px 10px" }}>
              {[
                { icon: Plus,         label: "New post",        href: "/posts/new" },
                { icon: Sparkles,     label: "AI Studio",       href: "/ai-studio" },
                { icon: Clock,        label: "Schedule content", href: "/calendar" },
                { icon: CheckCircle2, label: "Review drafts",   href: "/posts?status=draft" },
              ].map(({ icon: Icon, label, href }) => (
                <Link key={href} href={href} className="sb-link" style={{ marginBottom: 0 }}>
                  <Icon size={13} style={{ color: "var(--text-muted)" }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
