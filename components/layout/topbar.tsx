"use client";
import { useState, useEffect } from "react";
import {
  Bell, Search, Sparkles, Menu, X, LayoutDashboard,
  PenSquare, CalendarDays, Megaphone, WandSparkles,
  BarChart3, RadioTower, Image, FolderKanban, Settings,
  HelpCircle, User
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard":        "Overview",
  "/ai-studio":        "AI Studio",
  "/image-studio":     "Image Studio",
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

const mobileNavLinks = [
  { href: "/dashboard",        label: "Overview",          icon: LayoutDashboard },
  { href: "/ai-studio",        label: "AI Studio",         icon: Sparkles },
  { href: "/image-studio",     label: "Image Studio",      icon: Image },
  { href: "/posts",            label: "Posts",             icon: PenSquare },
  { href: "/campaigns",        label: "Campaigns",         icon: Megaphone },
  { href: "/calendar",         label: "Calendar",          icon: CalendarDays },
  { href: "/workspace",        label: "Content Workspace", icon: WandSparkles },
  { href: "/analytics",        label: "Analytics",         icon: BarChart3 },
  { href: "/publishing",       label: "Publishing",        icon: RadioTower },
  { href: "/media-library",    label: "Media Library",     icon: Image },
  { href: "/posts/categories", label: "Categories",        icon: FolderKanban },
  { href: "/settings",         label: "Settings",          icon: Settings },
  { href: "/help",             label: "Help & Docs",       icon: HelpCircle },
];

interface TopbarProps {
  profile?: { name?: string | null; full_name?: string; email?: string } | null;
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
}

export function Topbar({ profile }: TopbarProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Listen for drawer toggle event from mobile bottom navigation
  useEffect(() => {
    const handleToggle = () => setDrawerOpen((prev) => !prev);
    const handleOpen = () => setDrawerOpen(true);
    window.addEventListener("toggle-mobile-drawer", handleToggle);
    window.addEventListener("open-mobile-drawer", handleOpen);
    return () => {
      window.removeEventListener("toggle-mobile-drawer", handleToggle);
      window.removeEventListener("open-mobile-drawer", handleOpen);
    };
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const title = Object.entries(pageTitles).find(([key]) =>
    pathname === key || (key !== "/posts" && pathname.startsWith(key + "/"))
  )?.[1] ?? (pathname.startsWith("/posts/") ? "Post Details" : "ContentAI");

  const email = profile?.email || "";
  const name = profile?.name || profile?.full_name || (email ? email.split("@")[0] : "User");
  const avatarLetter = (name || "U").charAt(0).toUpperCase();

  return (
    <>
      <header className="app-topbar">
        {/* Mobile Hamburger Button (< 1024px) */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="tb-icon-btn lg:hidden -ml-1 mr-1.5"
          aria-label="Open mobile menu"
        >
          <Menu size={17} />
        </button>

        <span className="tb-title truncate">{title}</span>

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
        <Link href="/ai-studio" className="btn btn-ai btn-sm shrink-0" style={{ gap: 6 }}>
          <Sparkles size={12} />
          <span className="tb-create-label">Create with AI</span>
        </Link>
      </header>

      {/* Mobile Drawer Overlay & Slide-out Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[10000] lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0c0c16] border-r border-white/[0.08] shadow-2xl flex flex-col z-10 animate-slide-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="sb-logo-icon" style={{ width: 28, height: 28 }}>
                  <Sparkles size={13} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white tracking-tight">ContentAI</div>
                  <div className="text-[10px] text-white/40">Mobile Navigation</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
                Workspace Menu
              </div>
              {mobileNavLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                        : "text-white/70 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon size={16} className={active ? "text-violet-400" : "text-white/40"} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-[#080810]/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300 shrink-0">
                  {avatarLetter}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{name}</div>
                  <div className="text-[10px] text-white/40 truncate">{email || "Workspace Member"}</div>
                </div>
              </div>
              <Link
                href="/settings"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/[0.05] transition"
                title="Settings"
              >
                <Settings size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
