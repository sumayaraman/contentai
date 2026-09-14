"use client";

import { useState } from "react";
import { CheckCircle2, Link2, Loader2, LogOut, ShieldAlert } from "lucide-react";
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
    <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-6 backdrop-blur-xl shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Social Accounts</h2>
          <p className="mt-1 text-xs text-white/50">Connect real accounts for direct publishing. Tokens are encrypted server-side.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
          <ShieldAlert size={13} /> Demo remains available
        </span>
      </div>

      {notice && (
        <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs font-medium text-violet-300">
          {notice}
        </div>
      )}

      <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
        {platforms.map((platform) => {
          const account = accounts.find((item) => item.platform === platform.key);
          return (
            <div key={platform.key} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition hover:border-violet-500/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white/90">{platform.name}</div>
                  <p className="mt-1 text-[11px] text-white/40">
                    {account ? `${account.account_name}${account.username ? ` · @${account.username}` : ""}` : platform.note}
                  </p>
                </div>
                {account ? (
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                ) : (
                  <Link2 className="text-white/30 shrink-0" size={18} />
                )}
              </div>

              <div className="mt-4">
                {account ? (
                  <button
                    type="button"
                    disabled={role === "MEMBER" || busy === account.id}
                    onClick={() => void disconnect(account.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
                  >
                    {busy === account.id ? <Loader2 className="animate-spin" size={13} /> : <LogOut size={13} />}
                    Disconnect
                  </button>
                ) : role === "MEMBER" ? (
                  <span className="text-[11px] text-white/40">Ask a workspace admin to connect this account.</span>
                ) : (
                  <a
                    href={platform.connect}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition"
                  >
                    <Link2 size={13} /> Connect {platform.name}
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

