"use client";

import { useState } from "react";
import { CheckCircle2, Globe, Link2, Loader2, LogOut, ShieldAlert } from "lucide-react";
import type { Platform } from "@/types/database";
import type { SocialAccount } from "@/lib/social/types";
import { disconnectAccount } from "@/lib/social/actions";

const platforms: { key: Platform; name: string; connect: string; note: string }[] = [
  { key: "INSTAGRAM", name: "Instagram", connect: "/api/social/meta/connect", note: "Connect a Meta professional account for feed and story publishing." },
  { key: "FACEBOOK", name: "Facebook", connect: "/api/social/meta/connect", note: "Publish directly to company Pages and brand channels." },
  { key: "LINKEDIN", name: "LinkedIn", connect: "/api/social/linkedin/connect", note: "Publish articles and updates using official LinkedIn OAuth." },
  { key: "X", name: "X", connect: "/api/social/x/connect", note: "Post status updates, threads, and media via X OAuth 2.0." },
];

export function SocialAccounts({ accounts, role, notice }: { accounts: SocialAccount[]; role: "OWNER" | "ADMIN" | "MEMBER"; notice?: string | null }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function disconnect(id: string) {
    if (!window.confirm("Disconnect this social account? Existing publication history will remain.")) return;
    setBusy(id);
    await disconnectAccount(id);
    setBusy(null);
    window.location.reload();
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d1a] shadow-xl shadow-black/20 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8 sm:py-6 border-b border-white/[0.06] bg-white/[0.015]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
            <Globe size={16} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white">Connected Social Accounts</h2>
            <p className="text-xs text-white/45 mt-0.5">Authorize real social platforms for one-click publishing</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
          <ShieldAlert size={12} /> Demo Simulation Available
        </span>
      </div>

      {notice && (
        <div className="mx-6 mt-6 sm:mx-8 sm:mt-6 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-xs font-medium text-violet-300">
          {notice}
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {platforms.map((platform) => {
            const account = accounts.find((item) => item.platform === platform.key);
            return (
              <div
                key={platform.key}
                className="flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#121222] p-5 transition-all hover:border-white/15"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{platform.name}</div>
                    <p className="mt-1 text-xs text-white/45 leading-relaxed">
                      {account ? `${account.account_name}${account.username ? ` · @${account.username}` : ""}` : platform.note}
                    </p>
                  </div>
                  {account ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      <CheckCircle2 size={15} />
                    </span>
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/30 border border-white/[0.08] shrink-0">
                      <Link2 size={14} />
                    </span>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                  {account ? (
                    <button
                      type="button"
                      disabled={role === "MEMBER" || busy === account.id}
                      onClick={() => void disconnect(account.id)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50 cursor-pointer"
                    >
                      {busy === account.id ? <Loader2 className="animate-spin" size={12} /> : <LogOut size={12} />}
                      <span>Disconnect</span>
                    </button>
                  ) : role === "MEMBER" ? (
                    <span className="text-[11px] text-white/40">Ask a workspace admin to connect.</span>
                  ) : (
                    <a
                      href={platform.connect}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3 text-xs font-medium text-white shadow-sm transition"
                    >
                      <Link2 size={13} />
                      <span>Connect {platform.name}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
