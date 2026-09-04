"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl items-center justify-center"><div className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">!</div><h1 className="mt-4 text-xl font-bold text-slate-950">Something went wrong</h1><p className="mt-2 text-sm text-slate-500">We could not load this workspace. Check your connection and try again.</p><button onClick={reset} className="mt-5 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Try again</button></div></div>;
}
