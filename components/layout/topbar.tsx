"use client";

import { Bell, Search, Sparkles, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface TopbarProps {
  profile?: {
    name?: string | null;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
}

const topNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/ai-studio", label: "AI Tools" },
  { href: "/image-studio", label: "Image Studio" },
  { href: "/image-studio?tab=video", label: "Video Studio" },
  { href: "/campaigns", label: "Templates" },
  { href: "/analytics", label: "Analytics" },
];

export function Topbar({ profile }: TopbarProps) {
  const pathname = usePathname();

  function toggleSidebar() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-sidebar"));
    }
  }

  const email = profile?.email || "";
  const name = profile?.name || profile?.full_name || (email ? email.split("@")[0] : "User");
  const avatarLetter = (name || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full h-[52px] bg-[#07070F]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Hamburger & Brand & Desktop Navigation */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile / Universal Sidebar Toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/[0.06] transition flex items-center justify-center shrink-0 -ml-1"
          aria-label="Toggle navigation menu"
          title="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* ContentAI Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group no-underline text-inherit shrink-0 mr-1"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(139,92,246,0.35)] shrink-0">
            <Sparkles size={14} />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white group-hover:text-violet-200 transition">
            ContentAI
          </span>
        </Link>

        {/* Desktop SaaS Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 ml-2" aria-label="Main Navigation">
          {topNavItems.map((item) => {
            const active =
              item.href === "/image-studio?tab=video"
                ? pathname === "/image-studio" &&
                  typeof window !== "undefined" &&
                  window.location.search.includes("tab=video")
                : item.href === "/image-studio"
                ? pathname === "/image-studio" &&
                  (typeof window === "undefined" || !window.location.search.includes("tab=video"))
                : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                  active
                    ? "text-white bg-white/[0.08]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Notifications, Create with AI, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Input */}
        <div className="hidden sm:flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 w-40 md:w-52 focus-within:border-violet-500/50 focus-within:bg-white/[0.06] transition">
          <Search size={13} className="text-white/40 shrink-0" />
          <input
            placeholder="Search..."
            aria-label="Search content and tools"
            className="bg-transparent border-none outline-none text-[12.5px] text-white placeholder-white/40 w-full min-w-0"
          />
          <kbd className="text-[10px] text-white/40 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded font-mono shrink-0">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/[0.06] transition shrink-0"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        {/* Create with AI CTA */}
        <Link
          href="/ai-studio"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-[12.5px] font-medium shadow-[0_0_14px_rgba(139,92,246,0.25)] hover:shadow-[0_0_18px_rgba(139,92,246,0.35)] transition shrink-0"
        >
          <Sparkles size={13} />
          <span className="hidden sm:inline">Create with AI</span>
          <span className="sm:hidden">Create</span>
        </Link>

        {/* Profile Avatar */}
        <Link
          href="/settings"
          className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 hover:border-violet-400 flex items-center justify-center text-xs font-semibold text-violet-300 transition shrink-0 ml-0.5"
          title={email ? `${name} (${email})` : name}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            avatarLetter
          )}
        </Link>
      </div>
    </header>
  );
}
