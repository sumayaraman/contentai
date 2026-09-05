import { Sparkles, TrendingUp, TrendingDown, Plus, ArrowRight, Clock, CheckCircle2, Zap } from "lucide-react";
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

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 28 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${Math.max(15, (v / max) * 100)}%`,
          background: "var(--accent)",
          opacity: 0.2 + (i / values.length) * 0.8,
          borderRadius: 2,
        }} />
      ))}
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

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

          {/* AI Insight */}
          <div className="ai-card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <div className="ai-dot" />
              <span className="ai-tag">AI Insight</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.55, marginBottom: 8 }}>
              LinkedIn posts with educational hooks are performing 38% better this week.
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.65 }}>
              Try leading with a bold question or surprising stat in your next post.
            </p>
            <Link href="/analytics" className="btn btn-primary btn-sm" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>
              View analytics
            </Link>
          </div>

          {/* Sparkline */}
          <div className="card">
            <div className="card-h">
              <span className="card-title">Engagement (7d)</span>
              <span style={{ fontSize: 11.5, color: "var(--green)", fontWeight: 500 }}>↑ 12%</span>
            </div>
            <div className="card-body">
              <Sparkline values={[28, 42, 32, 58, 50, 72, 88]} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: "var(--text-muted)" }}>{d}</span>
                ))}
              </div>
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
