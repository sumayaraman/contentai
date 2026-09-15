"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";
import { safeNextPath } from "@/lib/security/paths";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    window.location.assign(next);
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to your ContentAI workspace.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-semibold text-white/70">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#121222] px-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold text-white/70">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#121222] px-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>

        <div className="my-1 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/40">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <p className="text-center text-xs text-white/60">
          New to ContentAI?{" "}
          <Link href="/signup" className="font-semibold text-violet-400 hover:text-violet-300 transition">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
