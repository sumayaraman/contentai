"use client";

import { useState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import type { TeamMember } from "@/lib/workspace/types";
import type { UserRole } from "@/types/database";
import { removeMember, updateMemberRole, updatePreferredAIProvider, updateWorkspace } from "@/lib/workspace/actions";

function Notice({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-300">{message}</div>;
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

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div className={error ? "rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-medium text-rose-300" : ""}>
          <Notice message={message} />
          {error && <div>{error}</div>}
        </div>
      )}

      {/* Workspace Name */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-6 backdrop-blur-xl shadow-lg">
        <div>
          <h2 className="font-semibold text-white">Workspace</h2>
          <p className="mt-1 text-xs text-white/50">Update the name shown across your workspace.</p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="workspace-name" className="mb-2 block text-xs font-medium text-white/70">Workspace name</label>
            <input
              id="workspace-name"
              value={name}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
              disabled={role === "MEMBER"}
              className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500 disabled:opacity-40"
            />
          </div>
          <button
            type="button"
            onClick={() => void saveWorkspace()}
            disabled={role === "MEMBER" || busy === "workspace"}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {busy === "workspace" && <Loader2 size={14} className="animate-spin" />} Save workspace
          </button>
        </div>
        {role === "MEMBER" && <p className="mt-3 text-[11px] text-white/40">Only workspace owners and admins can change the workspace name.</p>}
      </section>

      {/* Team Access */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-6 backdrop-blur-xl shadow-lg">
        <div>
          <h2 className="font-semibold text-white">Team Access</h2>
          <p className="mt-1 text-xs text-white/50">Review workspace members and their access levels.</p>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[580px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-white/40">
                <th className="px-3 py-3 font-semibold">Member</th>
                <th className="px-3 py-3 font-semibold">Role</th>
                <th className="px-3 py-3 font-semibold">Joined</th>
                <th className="px-3 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {members.map((member) => (
                <tr key={member.membership_id}>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                        {(member.profile.name || member.profile.email).slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white/90">{member.profile.name || "Unnamed member"}</div>
                        <div className="text-[11px] text-white/40">{member.profile.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    {member.role === "OWNER" ? (
                      <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">OWNER</span>
                    ) : role === "OWNER" ? (
                      <select
                        aria-label={`Role for ${member.profile.email}`}
                        value={member.role}
                        disabled={busy === member.membership_id}
                        onChange={(event) => void changeRole(member, event.target.value as "ADMIN" | "MEMBER")}
                        className="rounded-lg border border-white/10 bg-[#16162a] px-2.5 py-1 text-xs font-medium text-white outline-none cursor-pointer"
                      >
                        <option value="ADMIN" className="bg-[#16162a] text-white">ADMIN</option>
                        <option value="MEMBER" className="bg-[#16162a] text-white">MEMBER</option>
                      </select>
                    ) : (
                      <span className="text-xs font-medium text-white/70">{member.role}</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-xs text-white/40">{new Date(member.joined_at).toLocaleDateString()}</td>
                  <td className="px-3 py-3.5 text-right">
                    {role === "OWNER" && member.role !== "OWNER" && (
                      <button
                        type="button"
                        onClick={() => void remove(member)}
                        disabled={busy === member.membership_id}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                    {member.role === "OWNER" && <span className="text-[11px] text-white/40">Workspace owner</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {role !== "OWNER" && <p className="mt-4 text-[11px] text-white/40">Only the workspace owner can change roles or remove members.</p>}
      </section>

      {/* AI Settings */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-6 backdrop-blur-xl shadow-lg">
        <div>
          <h2 className="font-semibold text-white">AI Settings</h2>
          <p className="mt-1 text-xs text-white/50">Choose the preferred provider for AI features in this workspace.</p>
        </div>
        <div className="mt-5 max-w-md">
          <label htmlFor="ai-provider" className="mb-2 block text-xs font-medium text-white/70">Preferred AI provider</label>
          <select
            id="ai-provider"
            value={provider}
            disabled={role === "MEMBER" || busy === "provider"}
            onChange={(event) => void saveProvider(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500 disabled:opacity-40 cursor-pointer"
          >
            <option value="auto" className="bg-[#16162a] text-white">Automatic</option>
            <option value="mock" className="bg-[#16162a] text-white">Demo Mode</option>
            <option value="openai" className="bg-[#16162a] text-white">OpenAI</option>
            <option value="anthropic" className="bg-[#16162a] text-white">Anthropic</option>
            <option value="groq" className="bg-[#16162a] text-white">Groq</option>
          </select>
        </div>
        {role === "MEMBER" && <p className="mt-3 text-[11px] text-white/40">Only workspace owners and admins can change workspace AI settings.</p>}
      </section>

      {/* Social Accounts Overview */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-6 backdrop-blur-xl shadow-lg">
        <div>
          <h2 className="font-semibold text-white">Social Accounts</h2>
          <p className="mt-1 text-xs text-white/50">Social connections are simulated until real publishing integrations are configured.</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {["Instagram", "Facebook", "LinkedIn", "X"].map((network) => (
            <div key={network} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div>
                <div className="text-xs font-semibold text-white/90">{network}</div>
                <div className="text-[11px] text-white/40">Simulated integration</div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300">
                <Check size={11} /> Ready
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

