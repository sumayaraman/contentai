"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";
import { Loader2 } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim() || null },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) { setError(error.message); return; }
      if (data.session) { router.push("/dashboard"); return; }
      setMessage("Account created — check your email to confirm, then sign in.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Set up your ContentAI workspace in seconds.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="mb-2 block text-xs font-semibold text-white/70">
            Your name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#121222] px-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            placeholder="Sumaya Rahman"
          />
        </div>

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
          <label htmlFor="password" className="mb-2 block text-xs font-semibold text-white/70">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#121222] px-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            placeholder="Min. 8 characters"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-300">
            {message}
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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>

        <p className="text-center text-xs text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition">
            Sign in
          </Link>
        </p>

        <p className="text-center text-[11px] text-white/40 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-white/60 hover:text-white transition">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white/60 hover:text-white transition">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
