import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-50 px-4 py-10"><div className="mx-auto flex w-full max-w-md flex-col"><Link href="/" className="mx-auto flex items-center gap-2 text-lg font-bold text-slate-950"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><Sparkles size={18} /></span>ContentAI</Link><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><h1 className="text-xl font-bold text-slate-950">{title}</h1><p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>{children}</div><p className="mt-6 text-center text-xs text-slate-400">ContentAI Phase 1 Foundation</p></div></main>;
}
