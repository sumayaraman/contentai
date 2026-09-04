"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/auth-shell";
import { safeNextPath } from "@/lib/security/paths";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(null); const supabase = createClient(); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) { setError(error.message); setLoading(false); return; } window.location.assign(next); }
  return <AuthShell title="Welcome back" subtitle="Sign in to continue to your ContentAI workspace."><form onSubmit={submit} className="mt-6 space-y-4"><div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label><input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div><div><div className="mb-2 flex justify-between"><label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label></div><input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div>{error && <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}<button disabled={loading} className="w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{loading ? "Signing in..." : "Sign in"}</button></form><p className="mt-6 text-center text-sm text-slate-500">New to ContentAI? <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">Create an account</Link></p></AuthShell>;
}
