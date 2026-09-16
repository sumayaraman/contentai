"use client";
import { Bell, Search, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard":        "Home",
  "/create":           "Create Studio",
  "/ai-assistant":     "AI Assistant",
  "/ai-studio":        "AI Studio",
  "/image-studio":     "Image Studio",
  "/posts/new":        "Create Post",
  "/posts/categories": "Categories",
  "/posts":            "Content",
  "/calendar":         "Calendar",
  "/campaigns":        "Campaigns",
  "/workspace":        "30-Day Content Workshop",
  "/analytics":        "Analytics",
  "/publishing":       "Publishing",
  "/media-library":    "Media Library",
  "/settings":         "Settings",
  "/help":             "Help & Documentation",
};

interface TopbarProps {
  profile?: { full_name?: string; email?: string } | null;
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
}

export function Topbar({ profile }: TopbarProps) {
  const pathname = usePathname();
  const title = Object.entries(pageTitles).find(([key]) =>
    pathname === key || (key !== "/posts" && pathname.startsWith(key + "/"))
  )?.[1] ?? (pathname.startsWith("/posts/") ? "Post Details" : "ContentAI");

  return (
    <header className="app-topbar">
      <span className="tb-title">{title}</span>

      {/* Search */}
      <div className="tb-search">
        <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
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
      <Link href="/create" className="btn btn-ai btn-sm" style={{ gap: 6 }}>
        <Sparkles size={12} />
        <span className="tb-create-label">Create with AI</span>
      </Link>
    </header>
  );
}
