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
        <Link
          key={href}
          href={href}
          className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-4 shadow-sm backdrop-blur-xl transition hover:border-violet-500/30 hover:bg-[#131322]/90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400 transition group-hover:scale-105">
            <Icon size={17} />
          </div>
          <span className="text-xs font-semibold text-white/90">{label}</span>
        </Link>
      ))}
    </div>
  );
}

