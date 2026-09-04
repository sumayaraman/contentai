"use client";

import { useState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import type { TeamMember } from "@/lib/workspace/types";
import type { UserRole } from "@/types/database";
import { removeMember, updateMemberRole, updatePreferredAIProvider, updateWorkspace } from "@/lib/workspace/actions";

function Notice({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>;
}

export function WorkspaceSettings({ workspace, role, members }: { workspace: { id: string; name: string; owner_id: string; created_at: string; updated_at: string; ai_provider: string }; role: UserRole; members: TeamMember[] }) {
  const [name, setName] = useState(workspace.name);
  const [provider, setProvider] = useState(workspace.ai_provider || "auto");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function saveWorkspace() {
    setBusy("workspace"); setMessage(null); setError(null);
    const result = await updateWorkspace(workspace.id, name);
    setBusy(null); if (result.error) setError(result.error); else setMessage("Workspace settings saved.");
  }

  async function saveProvider(value: string) {
    setProvider(value); setBusy("provider"); setMessage(null); setError(null);
    const result = await updatePreferredAIProvider(workspace.id, value);
    setBusy(null); if (result.error) setError(result.error); else setMessage("AI provider preference saved.");
  }

  async function changeRole(member: TeamMember, nextRole: "ADMIN" | "MEMBER") {
    setBusy(member.membership_id); setMessage(null); setError(null);
    const result = await updateMemberRole(workspace.id, member.membership_id, nextRole);
    setBusy(null); if (result.error) setError(result.error); else setMessage("Member role updated.");
  }

  async function remove(member: TeamMember) {
    if (!window.confirm(`Remove ${member.profile.name || member.profile.email} from this workspace?`)) return;
    setBusy(member.membership_id); setMessage(null); setError(null);
    const result = await removeMember(workspace.id, member.membership_id);
    setBusy(null); if (result.error) setError(result.error); else setMessage("Member removed.");
  }

  return <div className="space-y-6">
    {(message || error) && <div className={error ? "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" : ""}><Notice message={message} />{error && <div>{error}</div>}</div>}

    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div><h2 className="font-semibold text-slate-950">Workspace</h2><p className="mt-1 text-sm text-slate-500">Update the name shown across your workspace.</p></div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex-1"><label htmlFor="workspace-name" className="mb-2 block text-sm font-medium text-slate-700">Workspace name</label><input id="workspace-name" value={name} maxLength={120} onChange={(event) => setName(event.target.value)} disabled={role === "MEMBER"} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400" /></div><button type="button" onClick={() => void saveWorkspace()} disabled={role === "MEMBER" || busy === "workspace"} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy === "workspace" && <Loader2 size={15} className="animate-spin" />}Save workspace</button></div>
      {role === "MEMBER" && <p className="mt-3 text-xs text-slate-500">Only workspace owners and admins can change the workspace name.</p>}
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div><h2 className="font-semibold text-slate-950">Team</h2><p className="mt-1 text-sm text-slate-500">Review workspace members and their access levels.</p></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400"><th className="px-3 py-3 font-semibold">Member</th><th className="px-3 py-3 font-semibold">Role</th><th className="px-3 py-3 font-semibold">Joined</th><th className="px-3 py-3 text-right font-semibold">Actions</th></tr></thead><tbody>{members.map((member) => <tr key={member.membership_id} className="border-b border-slate-100 last:border-0"><td className="px-3 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{(member.profile.name || member.profile.email).slice(0, 1).toUpperCase()}</div><div><div className="text-sm font-semibold text-slate-900">{member.profile.name || "Unnamed member"}</div><div className="text-xs text-slate-500">{member.profile.email}</div></div></div></td><td className="px-3 py-4">{member.role === "OWNER" ? <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">OWNER</span> : role === "OWNER" ? <select aria-label={`Role for ${member.profile.email}`} value={member.role} disabled={busy === member.membership_id} onChange={(event) => void changeRole(member, event.target.value as "ADMIN" | "MEMBER")} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"><option value="ADMIN">ADMIN</option><option value="MEMBER">MEMBER</option></select> : <span className="text-sm font-medium text-slate-700">{member.role}</span>}</td><td className="px-3 py-4 text-sm text-slate-500">{new Date(member.joined_at).toLocaleDateString()}</td><td className="px-3 py-4 text-right">{role === "OWNER" && member.role !== "OWNER" && <button type="button" onClick={() => void remove(member)} disabled={busy === member.membership_id} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14} />Remove</button>}{member.role === "OWNER" && <span className="text-xs text-slate-400">Workspace owner</span>}</td></tr>)}</tbody></table></div>
      {role !== "OWNER" && <p className="mt-4 text-xs text-slate-500">Only the workspace owner can change roles or remove members.</p>}
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div><h2 className="font-semibold text-slate-950">AI Settings</h2><p className="mt-1 text-sm text-slate-500">Choose the preferred provider for AI features in this workspace.</p></div>
      <div className="mt-5 max-w-md"><label htmlFor="ai-provider" className="mb-2 block text-sm font-medium text-slate-700">Preferred AI provider</label><select id="ai-provider" value={provider} disabled={role === "MEMBER" || busy === "provider"} onChange={(event) => void saveProvider(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"><option value="auto">Automatic</option><option value="mock">Demo Mode</option><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="groq">Groq</option></select></div>
      {role === "MEMBER" && <p className="mt-3 text-xs text-slate-500">Only workspace owners and admins can change workspace AI settings.</p>}
    </section>

    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div><h2 className="font-semibold text-slate-950">Social Accounts</h2><p className="mt-1 text-sm text-slate-500">Social connections are simulated until real publishing integrations are introduced.</p></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{["Instagram", "Facebook", "LinkedIn", "X"].map((network) => <div key={network} className="flex items-center justify-between rounded-lg border border-slate-200 p-4"><div><div className="text-sm font-semibold text-slate-900">{network}</div><div className="text-xs text-slate-500">Not connected</div></div><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"><Check size={12} />Simulated</span></div>)}</div>
    </section>
  </div>;
}
