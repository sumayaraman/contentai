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
    setBusy(id); await disconnectAccount(id); setBusy(null); window.location.reload();
  }
  return <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-slate-950">Social Accounts</h2><p className="mt-1 text-sm text-slate-500">Connect real accounts for publishing. Tokens are encrypted server-side and never shown here.</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"><ShieldAlert size={13}/> Demo remains available</span></div>
    {notice && <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{notice}</div>}
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {platforms.map((platform) => {
        const account = accounts.find((item) => item.platform === platform.key);
        return <div key={platform.key} className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-slate-900">{platform.name}</div><p className="mt-1 text-xs text-slate-500">{account ? `${account.account_name}${account.username ? ` · @${account.username}` : ""}` : platform.note}</p></div>{account ? <CheckCircle2 className="text-emerald-600" size={18}/> : <Link2 className="text-slate-400" size={18}/>}</div>
          <div className="mt-4">{account ? <button type="button" disabled={role==="MEMBER"||busy===account.id} onClick={()=>void disconnect(account.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">{busy===account.id?<Loader2 className="animate-spin" size={14}/>:<LogOut size={14}/>}Disconnect</button> : role==="MEMBER" ? <span className="text-xs text-slate-400">Ask a workspace admin to connect this account.</span> : <a href={platform.connect} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"><Link2 size={14}/>Connect {platform.name}</a>}</div>
        </div>;
      })}
    </div>
  </section>;
}
