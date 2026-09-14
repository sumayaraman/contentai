"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl" role="alert">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-lg font-bold text-red-400">
          !
        </div>
        <h1 className="mt-4 text-xl font-bold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {error?.message || "ContentAI could not complete that request. Please try again."}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Try again
          </button>

          <Link
            href="/dashboard"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Go to Dashboard
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-lg border border-transparent px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Sign out &amp; return to login
          </button>
        </div>
      </section>
    </main>
  );
}
