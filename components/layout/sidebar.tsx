"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, FolderKanban, Image, LayoutDashboard, Megaphone, PenSquare, RadioTower, Settings, Sparkles } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-studio", label: "AI Studio", icon: Sparkles },
  { href: "/posts", label: "Posts", icon: PenSquare },
  { href: "/posts/categories", label: "Categories", icon: FolderKanban },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/publishing", label: "Publishing", icon: RadioTower },
  { href: "/media-library", label: "Media Library", icon: Image },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Sparkles size={18} />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-950">ContentAI</div>
          <div className="text-[11px] text-slate-500">Content workspace</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold text-slate-900">Phase 1 Foundation</div>
        <p className="mt-1 text-xs leading-5 text-slate-500">Workspace, authentication, database and dashboard foundation are ready.</p>
      </div>
    </aside>
  );
}
