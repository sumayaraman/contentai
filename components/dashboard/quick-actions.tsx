import Link from "next/link";
import { CalendarDays, Megaphone, PenSquare, Sparkles } from "lucide-react";

const actions = [
  { href: "/posts/new", label: "Create Post", icon: PenSquare },
  { href: "/ai-studio", label: "Generate with AI", icon: Sparkles },
  { href: "/campaigns", label: "Create Campaign", icon: Megaphone },
  { href: "/calendar", label: "Open Calendar", icon: CalendarDays },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700"><Icon size={17} /></div>
          <span className="text-sm font-semibold text-slate-800">{label}</span>
        </Link>
      ))}
    </div>
  );
}
