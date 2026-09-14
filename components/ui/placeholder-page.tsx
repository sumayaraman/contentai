import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function PlaceholderPage({ icon: Icon, title, description, action = "Dashboard", href = "/dashboard" }: { icon: LucideIcon; title: string; description: string; action?: string; href?: string }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center justify-center">
      <div className="w-full rounded-3xl border border-white/[0.08] bg-[#0f0f1a]/80 p-8 text-center shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-400 shadow-sm">
          <Icon size={24} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-violet-400">Coming soon</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-white/50">{description}</p>
        <Link
          href={href}
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition"
        >
          {action}
        </Link>
      </div>
    </div>
  );
}

