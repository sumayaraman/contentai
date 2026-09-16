"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, CalendarDays, FolderKanban, Image, WandSparkles,
  LayoutDashboard, Megaphone, PenSquare, RadioTower,
  Settings, Sparkles, ChevronDown, HelpCircle
} from "lucide-react";

const navMain = [
  { href: "/dashboard",     label: "Overview",      icon: LayoutDashboard },
  { href: "/ai-studio",     label: "AI Studio",     icon: Sparkles },
  { href: "/posts",         label: "Posts",         icon: PenSquare },
  { href: "/calendar",      label: "Calendar",      icon: CalendarDays },
  { href: "/campaigns",     label: "Campaigns",     icon: Megaphone },
  { href: "/workspace",     label: "Content Workspace", icon: WandSparkles },
  { href: "/analytics",     label: "Analytics",     icon: BarChart3 },
  { href: "/publishing",    label: "Publishing",    icon: RadioTower },
  { href: "/media-library", label: "Media Library", icon: Image },
];

const navWorkspace = [
  { href: "/posts/categories", label: "Categories", icon: FolderKanban },
  { href: "/settings",         label: "Settings",   icon: Settings },
  { href: "/help",             label: "Help & docs", icon: HelpCircle },
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
    <aside className="app-sidebar">
      {/* Ambient orbs */}
      <div className="orb orb-violet" style={{
        width: 220, height: 220, top: -60, left: -60, position: "absolute"
      }} />
      <div className="orb orb-purple" style={{
        width: 140, height: 140, bottom: 100, right: -40, position: "absolute"
      }} />

      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-icon">
          <Sparkles size={14} />
        </div>
        <div>
          <div className="sb-logo-name">ContentAI</div>
          <div className="sb-logo-sub">Content workspace</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        <div className="sb-section">Main</div>
        {navMain.map(({ href, label, icon: Icon }, i) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`sb-link${active ? " active" : ""}`}
            >
              <Icon size={14} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              {label}
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
              className={`sb-link${active ? " active" : ""}`}
            >
              <Icon size={14} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="sb-footer">
        <Link
          href="/settings"
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
  );
}
