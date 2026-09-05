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
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label htmlFor="password" className="label" style={{ marginBottom: 0 }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--accent)" }}>
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
            className="input"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{
            background: "var(--red-soft)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--r-sm)",
            padding: "10px 13px",
            fontSize: 12.5,
            color: "var(--red)",
            animation: "bounce-in 0.3s ease forwards"
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-ai btn-lg"
          style={{ width: "100%", marginTop: 4 }}
        >
          {loading ? (
            <>
              <Loader2 size={14} style={{ animation: "spin-slow 1s linear infinite" }} />
              Signing in…
            </>
          ) : "Sign in"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          New to ContentAI?{" "}
          <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 500 }}>
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
