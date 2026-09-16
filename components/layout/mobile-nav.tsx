"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Menu, PenSquare, Settings, Sparkles } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/posts", label: "Posts", icon: PenSquare },
  { href: "/ai-studio", label: "AI", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  function toggleMenu() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-mobile-drawer"));
    }
  }

  return (
    <nav aria-label="Mobile navigation" className="mobile-nav" style={{ zIndex: 9999 }}>
      <div className="mobile-nav-grid">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`mobile-nav-link${active ? " active" : ""}`}
            >
              <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={toggleMenu}
          className="mobile-nav-link"
          aria-label="Open workspace menu"
        >
          <Menu size={18} strokeWidth={1.8} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}

