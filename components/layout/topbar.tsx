"use client";
import { Bell, Search, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard":      "Overview",
  "/ai-studio":      "AI Studio",
  "/posts":          "Posts",
  "/calendar":       "Calendar",
  "/campaigns":      "Campaigns",
  "/analytics":      "Analytics",
  "/publishing":     "Publishing",
  "/media-library":  "Media Library",
  "/settings":       "Settings",
};

interface TopbarProps {
  profile?: { full_name?: string; email?: string } | null;
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
}

export function Topbar({ profile }: TopbarProps) {
  const pathname = usePathname();
  const title = Object.entries(pageTitles).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] ?? "ContentAI";

  return (
    <header className="app-topbar">
      <span className="tb-title">{title}</span>

      {/* Search */}
      <div className="tb-search">
        <Search size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input placeholder="Search content…" aria-label="Search" />
        <kbd style={{
          fontSize: 9.5,
          color: "var(--text-muted)",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 4,
          padding: "2px 5px",
          flexShrink: 0,
          fontFamily: "inherit",
          border: "1px solid var(--border)"
        }}>⌘K</kbd>
      </div>

      {/* Notifications */}
      <button className="tb-icon-btn" aria-label="Notifications">
        <Bell size={14} />
      </button>

      {/* Create with AI */}
      <Link href="/ai-studio" className="btn btn-ai btn-sm" style={{ gap: 6 }}>
        <Sparkles size={12} />
        Create with AI
      </Link>
    </header>
  );
}
