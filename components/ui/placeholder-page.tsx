import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function PlaceholderPage({ icon: Icon, title, description, action = "Dashboard", href = "/dashboard" }: { icon: LucideIcon; title: string; description: string; action?: string; href?: string }) {
  return <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center justify-center"><div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={24} /></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Coming in a later phase</p><h1 className="mt-2 text-2xl font-bold text-slate-950">{title}</h1><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p><Link href={href} className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">{action}</Link></div></div>;
}
