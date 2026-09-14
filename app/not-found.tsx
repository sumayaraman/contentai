import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07070f] px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0f0f1a]/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-400">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Page not found</h1>
        <p className="mt-2 text-xs leading-relaxed text-white/50">The page you requested does not exist or has been moved.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}

