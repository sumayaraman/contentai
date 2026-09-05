"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, CalendarDays, FolderKanban, Image,
  LayoutDashboard, Megaphone, PenSquare, RadioTower,
  Settings, Sparkles, ChevronDown, HelpCircle
} from "lucide-react";

const navMain = [
  { href: "/dashboard",     label: "Overview",      icon: LayoutDashboard },
  { href: "/ai-studio",     label: "AI Studio",     icon: Sparkles },
  { href: "/posts",         label: "Posts",         icon: PenSquare },
  { href: "/calendar",      label: "Calendar",      icon: CalendarDays },
  { href: "/campaigns",     label: "Campaigns",     icon: Megaphone },
  { href: "/analytics",     label: "Analytics",     icon: BarChart3 },
  { href: "/publishing",    label: "Publishing",    icon: RadioTower },
  { href: "/media-library", label: "Media Library", icon: Image },
];

const navWorkspace = [
  { href: "/posts/categories", label: "Categories", icon: FolderKanban },
  { href: "/settings",         label: "Settings",   icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

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

        <div className="sb-divider" />
        <Link href="/help" className="sb-link">
          <HelpCircle size={14} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          Help & docs
        </Link>
      </nav>

      {/* User */}
      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-avatar">S</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-user-name">Sumaya Rahman</div>
            <div className="sb-user-plan">Free plan</div>
          </div>
          <ChevronDown size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
