"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  FolderKanban,
  Image as ImageIcon,
  LayoutDashboard,
  Megaphone,
  Settings,
  Sparkles,
  Video,
  Bookmark,
  ChevronDown,
  X,
  Bot,
  RadioTower,
} from "lucide-react";

interface SidebarProps {
  profile?: {
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
}

export function Sidebar({ profile }: SidebarProps = {}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle global toggle/open/close events
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("open-sidebar", handleOpen);
    window.addEventListener("close-sidebar", handleClose);

    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("open-sidebar", handleOpen);
      window.removeEventListener("close-sidebar", handleClose);
    };
  }, []);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const email = profile?.email || "";
  const hasCustomName = Boolean(profile?.name?.trim());
  const name = hasCustomName
    ? profile!.name!.trim()
    : email
    ? email.split("@")[0]
    : "User";
  const subtitle = email || "Pro Plan";
  const avatarLetter = (name || email || "U").charAt(0).toUpperCase();

  const isActive = (href: string) => {
    if (href === "/image-studio?tab=video") {
      return (
        pathname === "/image-studio" &&
        typeof window !== "undefined" &&
        window.location.search.includes("tab=video")
      );
    }
    if (href === "/image-studio") {
      return (
        pathname === "/image-studio" &&
        (typeof window === "undefined" || !window.location.search.includes("tab=video"))
      );
    }
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`app-sidebar-backdrop${isOpen ? " open" : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Collapsible Drawer Sidebar */}
      <aside className={`app-sidebar${isOpen ? " open" : ""}`} aria-label="Sidebar Navigation">
        {/* Subtle Ambient orbs */}
        <div
          className="orb orb-violet"
          style={{ width: 180, height: 180, top: -40, left: -40, position: "absolute", opacity: 0.15 }}
        />
        <div
          className="orb orb-purple"
          style={{ width: 120, height: 120, bottom: 80, right: -30, position: "absolute", opacity: 0.12 }}
        />

        {/* Logo & Close Button */}
        <div className="sb-logo flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 text-inherit no-underline"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(139,92,246,0.35)] shrink-0">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-white leading-tight">ContentAI</div>
              <div className="text-[10px] text-white/40">Creative Workspace</div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/[0.08] transition"
            aria-label="Close menu"
          >
            <X size={17} />
          </button>
        </div>

        {/* Structured Navigation Links */}
        <nav className="sb-nav">
          {/* Overview */}
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/dashboard") ? " active" : ""}`}
          >
            <LayoutDashboard size={15} strokeWidth={isActive("/dashboard") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>Overview</span>
          </Link>

          {/* CREATE SECTION */}
          <div className="sb-section">CREATE</div>
          <Link
            href="/ai-studio"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/ai-studio") ? " active" : ""}`}
          >
            <Sparkles size={15} strokeWidth={isActive("/ai-studio") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>AI Writer</span>
          </Link>
          <Link
            href="/image-studio"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/image-studio") ? " active" : ""}`}
          >
            <ImageIcon size={15} strokeWidth={isActive("/image-studio") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>Image Studio</span>
          </Link>
          <Link
            href="/image-studio?tab=video"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/image-studio?tab=video") ? " active" : ""}`}
          >
            <Video size={15} strokeWidth={isActive("/image-studio?tab=video") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>Video Studio</span>
          </Link>
          <Link
            href="/campaigns"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/campaigns") ? " active" : ""}`}
          >
            <Megaphone size={15} strokeWidth={isActive("/campaigns") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>Campaign Builder</span>
          </Link>

          {/* WORKSPACE SECTION */}
          <div className="sb-divider" />
          <div className="sb-section">WORKSPACE</div>
          <Link
            href="/posts"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/posts") ? " active" : ""}`}
          >
            <FolderKanban size={15} strokeWidth={isActive("/posts") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>My Creations</span>
          </Link>
          <Link
            href="/media-library"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/media-library") ? " active" : ""}`}
          >
            <Bookmark size={15} strokeWidth={isActive("/media-library") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>Favorites</span>
          </Link>
          <Link
            href="/calendar"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/calendar") ? " active" : ""}`}
          >
            <CalendarDays size={15} strokeWidth={isActive("/calendar") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>History</span>
          </Link>
          <Link
            href="/publishing"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/publishing") ? " active" : ""}`}
          >
            <RadioTower size={15} strokeWidth={isActive("/publishing") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>Publishing</span>
          </Link>

          {/* ANALYTICS SECTION */}
          <div className="sb-divider" />
          <div className="sb-section">ANALYTICS</div>
          <Link
            href="/analytics"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/analytics") ? " active" : ""}`}
          >
            <BarChart3 size={15} strokeWidth={isActive("/analytics") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>Performance</span>
          </Link>

          {/* SYSTEM */}
          <div className="sb-divider" />
          <Link
            href="/ai-assistant"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/ai-assistant") ? " active" : ""}`}
          >
            <Bot size={15} strokeWidth={isActive("/ai-assistant") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>AI Assistant</span>
          </Link>
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className={`sb-link${isActive("/settings") ? " active" : ""}`}
          >
            <Settings size={15} strokeWidth={isActive("/settings") ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
            <span>Settings</span>
          </Link>
        </nav>

        {/* User Profile Footer */}
        <div className="sb-footer">
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="sb-user"
            title={email ? `${name} (${email})` : name}
            style={{ textDecoration: "none" }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                className="sb-avatar"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="sb-avatar">{avatarLetter}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="sb-user-name"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </div>
              <div
                className="sb-user-plan"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {subtitle}
              </div>
            </div>
            <ChevronDown size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          </Link>
        </div>
      </aside>
    </>
  );
}
