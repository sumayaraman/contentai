"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, CalendarDays, FolderKanban, Image, WandSparkles,
  LayoutDashboard, Megaphone, PenSquare, RadioTower,
  Settings, Sparkles, ChevronDown, HelpCircle, X, Menu, Bot
} from "lucide-react";

const navMain = [
  { href: "/dashboard",     label: "Overview",             icon: LayoutDashboard },
  { href: "/ai-assistant",  label: "AI Assistant",         icon: Bot },
  { href: "/ai-studio",     label: "AI Studio",            icon: Sparkles },
  { href: "/image-studio",  label: "Image & Video Studio", icon: Image },
  { href: "/posts",         label: "Posts",                icon: PenSquare },
  { href: "/calendar",      label: "Calendar",             icon: CalendarDays },
  { href: "/campaigns",     label: "Campaigns",            icon: Megaphone },
  { href: "/workspace",     label: "Content Workspace",    icon: WandSparkles },
  { href: "/analytics",     label: "Analytics",            icon: BarChart3 },
  { href: "/publishing",    label: "Publishing",           icon: RadioTower },
  { href: "/media-library", label: "Media Library",        icon: Image },
];

const navWorkspace = [
  { href: "/posts/categories", label: "Categories",  icon: FolderKanban },
  { href: "/settings",         label: "Settings",    icon: Settings },
  { href: "/help",             label: "Help & Docs", icon: HelpCircle },
];

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
    : (email ? email.split("@")[0] : "User");
  const subtitle = email || "Free plan";
  const avatarLetter = (name || email || "U").charAt(0).toUpperCase();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

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
        {/* Ambient orbs */}
        <div
          className="orb orb-violet"
          style={{ width: 220, height: 220, top: -60, left: -60, position: "absolute" }}
        />
        <div
          className="orb orb-purple"
          style={{ width: 140, height: 140, bottom: 100, right: -40, position: "absolute" }}
        />

        {/* Logo & Close Button */}
        <div className="sb-logo flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 text-inherit no-underline"
          >
            <div className="sb-logo-icon">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="sb-logo-name">ContentAI</div>
              <div className="sb-logo-sub">Creative Workspace</div>
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

        {/* Navigation Links */}
        <nav className="sb-nav">
          <div className="sb-section">Studios &amp; Tools</div>
          {navMain.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`sb-link${active ? " active" : ""}`}
              >
                <Icon size={14} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </Link>
            );
          })}

          <div className="sb-divider" />
          <div className="sb-section">Workspace</div>
          {navWorkspace.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`sb-link${active ? " active" : ""}`}
              >
                <Icon size={14} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </Link>
            );
          })}
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
