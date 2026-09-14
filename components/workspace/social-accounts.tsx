"use client";

import { useState } from "react";
import { CheckCircle2, Globe, Link2, Loader2, LogOut, ShieldAlert } from "lucide-react";
import type { Platform } from "@/types/database";
import type { SocialAccount } from "@/lib/social/types";
import { disconnectAccount } from "@/lib/social/actions";

const platforms: { key: Platform; name: string; connect: string; note: string }[] = [
  { key: "INSTAGRAM", name: "Instagram", connect: "/api/social/meta/connect", note: "Meta professional account required for API publishing." },
  { key: "FACEBOOK", name: "Facebook", connect: "/api/social/meta/connect", note: "Connect a Facebook Page through Meta." },
  { key: "LINKEDIN", name: "LinkedIn", connect: "/api/social/linkedin/connect", note: "Member publishing uses LinkedIn OAuth." },
  { key: "X", name: "X", connect: "/api/social/x/connect", note: "Uses X OAuth 2.0 with PKCE." },
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
    <section className="rounded-2xl border border-white/10 bg-[#0f0f1a]/90 p-7 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Globe size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Connected Social Accounts</h2>
            <p className="text-xs text-white/50">Authorize official social channels to enable automated and scheduled publishing.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 self-start sm:self-auto">
          <ShieldAlert size={14} /> Demo simulation active
        </span>
      </div>

      {notice && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-xs font-medium text-violet-300">
          {notice}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {platforms.map((platform) => {
          const account = accounts.find((item) => item.platform === platform.key);
          return (
            <div
              key={platform.key}
              className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121226]/80 p-5 transition-all duration-200 hover:border-violet-500/30 hover:bg-[#15152c] shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{platform.name}</div>
                  <p className="mt-1 text-xs text-white/50 leading-relaxed">
                    {account ? `${account.account_name}${account.username ? ` · @${account.username}` : ""}` : platform.note}
                  </p>
                </div>
                {account ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 size={16} />
                  </span>
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/30 border border-white/[0.08] shrink-0">
                    <Link2 size={15} />
                  </span>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                {account ? (
                  <button
                    type="button"
                    disabled={role === "MEMBER" || busy === account.id}
                    onClick={() => void disconnect(account.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
                  >
                    {busy === account.id ? <Loader2 className="animate-spin" size={14} /> : <LogOut size={14} />}
                    Disconnect
                  </button>
                ) : role === "MEMBER" ? (
                  <span className="text-xs text-white/40">Ask a workspace admin to connect this account.</span>
                ) : (
                  <a
                    href={platform.connect}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition"
                  >
                    <Link2 size={14} /> Connect {platform.name}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
