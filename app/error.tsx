"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm" role="alert">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-red-600">!</div>
        <h1 className="mt-4 text-xl font-bold text-slate-950">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">ContentAI could not complete that request. Please try again.</p>
        <button type="button" onClick={reset} className="mt-5 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">Try again</button>
      </section>
    </main>
  );
}
