"use client";

import { Bell, Search, Sparkles, Menu, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard":        "Overview",
  "/ai-studio":        "AI Studio",
  "/image-studio":     "Image & Video Studio",
  "/posts/new":        "Create Post",
  "/posts/categories": "Categories",
  "/posts":            "Posts",
  "/calendar":         "Calendar",
  "/campaigns":        "Campaigns",
  "/workspace":        "Content Workspace",
  "/analytics":        "Analytics",
  "/publishing":       "Publishing",
  "/media-library":    "Media Library",
  "/settings":         "Settings",
  "/help":             "Help & Documentation",
};

interface TopbarProps {
  profile?: { name?: string | null; full_name?: string; email?: string; avatar_url?: string } | null;
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
}

export function Topbar({ profile }: TopbarProps) {
  const pathname = usePathname();

  function toggleSidebar() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-sidebar"));
    }
  }

  const title = Object.entries(pageTitles).find(([key]) =>
    pathname === key || (key !== "/posts" && pathname.startsWith(key + "/"))
  )?.[1] ?? (pathname.startsWith("/posts/") ? "Post Details" : "ContentAI");

  const email = profile?.email || "";
  const name = profile?.name || profile?.full_name || (email ? email.split("@")[0] : "User");
  const avatarLetter = (name || "U").charAt(0).toUpperCase();

  return (
    <header className="app-topbar">
      {/* Menu Hamburger Button (Universal: desktop, tablet, and mobile) */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="tb-icon-btn -ml-1 mr-1.5"
        aria-label="Toggle navigation menu"
        title="Toggle Menu (Esc to close)"
      >
        <Menu size={17} />
      </button>

      {/* Brand Logo & Name */}
      <Link href="/dashboard" className="flex items-center gap-2 mr-3 group no-underline text-inherit shrink-0">
        <div className="sb-logo-icon" style={{ width: 28, height: 28 }}>
          <Sparkles size={13} />
        </div>
        <span className="font-bold text-sm tracking-tight text-white group-hover:text-violet-300 transition hidden sm:inline">
          ContentAI
        </span>
      </Link>

      {/* Page Title / Location indicator */}
      <span className="tb-title truncate text-xs sm:text-sm font-semibold opacity-90">{title}</span>

      {/* Search Bar */}
      <div className="tb-search">
        <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input placeholder="Search content &amp; tools…" aria-label="Search" />
        <kbd
          style={{
            fontSize: 9.5,
            color: "var(--text-muted)",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 4,
            padding: "2px 5px",
            flexShrink: 0,
            fontFamily: "inherit",
            border: "1px solid var(--border)",
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Notifications Button */}
      <button className="tb-icon-btn shrink-0" aria-label="Notifications" title="Notifications">
        <Bell size={14} />
      </button>

      {/* Create with AI Glow Action */}
      <Link href="/ai-studio" className="btn btn-ai btn-sm shrink-0" style={{ gap: 6 }}>
        <Sparkles size={12} />
        <span className="tb-create-label">Create with AI</span>
      </Link>

      {/* User Avatar linking to settings */}
      <Link
        href="/settings"
        className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300 hover:border-violet-400 transition shrink-0 ml-1"
        title={email ? `${name} (${email})` : name}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          avatarLetter
        )}
      </Link>
    </header>
  );
}
