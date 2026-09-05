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
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <div>
          <label htmlFor="name" className="label">Your name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="input"
            placeholder="Sumaya Rahman"
          />
        </div>

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
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Min. 8 characters"
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

        {message && (
          <div style={{
            background: "var(--green-soft)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "var(--r-sm)",
            padding: "10px 13px",
            fontSize: 12.5,
            color: "var(--green)",
            animation: "bounce-in 0.3s ease forwards"
          }}>
            {message}
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
              Creating account…
            </>
          ) : "Create account"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>

        <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
          By creating an account you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--text-secondary)" }}>Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" style={{ color: "var(--text-secondary)" }}>Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
