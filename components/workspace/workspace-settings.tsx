"use client";

import { useState } from "react";
import { Bot, Building2, Check, Loader2, Shield, Trash2, Users } from "lucide-react";
import type { TeamMember } from "@/lib/workspace/types";
import type { UserRole } from "@/types/database";
import { removeMember, updateMemberRole, updatePreferredAIProvider, updateWorkspace } from "@/lib/workspace/actions";

function Notice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-xs font-medium text-emerald-300">
      {message}
    </div>
  );
}

export function WorkspaceSettings({
  workspace,
  role,
  members,
}: {
  workspace: { id: string; name: string; owner_id: string; created_at: string; updated_at: string; ai_provider: string };
  role: UserRole;
  members: TeamMember[];
}) {
  const [name, setName] = useState(workspace.name);
  const [provider, setProvider] = useState(workspace.ai_provider || "auto");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function saveWorkspace() {
    setBusy("workspace");
    setMessage(null);
    setError(null);
    const result = await updateWorkspace(workspace.id, name);
    setBusy(null);
    if (result.error) setError(result.error);
    else setMessage("Workspace settings saved.");
  }

  async function saveProvider(value: string) {
    setProvider(value);
    setBusy("provider");
    setMessage(null);
    setError(null);
    const result = await updatePreferredAIProvider(workspace.id, value);
    setBusy(null);
    if (result.error) setError(result.error);
    else setMessage("AI provider preference saved.");
  }

  async function changeRole(member: TeamMember, nextRole: "ADMIN" | "MEMBER") {
    setBusy(member.membership_id);
    setMessage(null);
    setError(null);
    const result = await updateMemberRole(workspace.id, member.membership_id, nextRole);
    setBusy(null);
    if (result.error) setError(result.error);
    else setMessage("Member role updated.");
  }

  async function remove(member: TeamMember) {
    if (!window.confirm(`Remove ${member.profile.name || member.profile.email} from this workspace?`)) return;
    setBusy(member.membership_id);
    setMessage(null);
    setError(null);
    const result = await removeMember(workspace.id, member.membership_id);
    setBusy(null);
    if (result.error) setError(result.error);
    else setMessage("Member removed.");
  }

  return (
    <div className="space-y-10">
      {(message || error) && (
        <div className={error ? "rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-xs font-medium text-rose-300" : ""}>
          <Notice message={message} />
          {error && <div>{error}</div>}
        </div>
      )}

      {/* Workspace Name */}
      <section className="rounded-2xl border border-white/10 bg-[#0f0f1a]/90 p-7 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3 pb-5 border-b border-white/[0.08]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Workspace Information</h2>
            <p className="text-xs text-white/50">Update the workspace title shown across campaigns, teams, and navigation.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="workspace-name" className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-white/70">
              Workspace Name
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center max-w-2xl">
              <input
                id="workspace-name"
                value={name}
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
                disabled={role === "MEMBER"}
                placeholder="e.g. Acme Marketing Studio"
                className="h-12 flex-1 rounded-xl border border-white/10 bg-[#141428] px-4 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-40"
              />
              <button
                type="button"
                onClick={() => void saveWorkspace()}
                disabled={role === "MEMBER" || busy === "workspace"}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
              >
                {busy === "workspace" && <Loader2 size={16} className="animate-spin" />}
                Save workspace
              </button>
            </div>
          </div>
          {role === "MEMBER" && (
            <p className="text-xs text-white/40">Only workspace owners and admins can rename the workspace.</p>
          )}
        </div>
      </section>

      {/* Team Access */}
      <section className="rounded-2xl border border-white/10 bg-[#0f0f1a]/90 p-7 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Team Access &amp; Permissions</h2>
              <p className="text-xs text-white/50">Manage assigned roles and membership privileges for this workspace.</p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#121226]/80 shadow-sm">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-4 font-semibold">Member</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {members.map((member) => (
                <tr key={member.membership_id} className="hover:bg-white/[0.02] transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                        {(member.profile.name || member.profile.email).slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {member.profile.name || "Unnamed member"}
                        </div>
                        <div className="truncate text-xs text-white/40">{member.profile.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {member.role === "OWNER" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                        <Shield size={12} /> OWNER
                      </span>
                    ) : role === "OWNER" ? (
                      <select
                        aria-label={`Role for ${member.profile.email}`}
                        value={member.role}
                        disabled={busy === member.membership_id}
                        onChange={(event) => void changeRole(member, event.target.value as "ADMIN" | "MEMBER")}
                        className="rounded-xl border border-white/10 bg-[#16162a] px-3 py-1.5 text-xs font-medium text-white outline-none cursor-pointer focus:border-violet-500"
                      >
                        <option value="ADMIN" className="bg-[#16162a] text-white">ADMIN</option>
                        <option value="MEMBER" className="bg-[#16162a] text-white">MEMBER</option>
                      </select>
                    ) : (
                      <span className="text-xs font-medium text-white/70">{member.role}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-white/40">
                    {new Date(member.joined_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {role === "OWNER" && member.role !== "OWNER" && (
                      <button
                        type="button"
                        onClick={() => void remove(member)}
                        disabled={busy === member.membership_id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    )}
                    {member.role === "OWNER" && (
                      <span className="text-xs text-white/40 font-medium">Workspace Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {role !== "OWNER" && (
          <p className="text-xs text-white/40">Only the workspace owner can modify member roles or remove users.</p>
        )}
      </section>

      {/* AI Settings */}
      <section className="rounded-2xl border border-white/10 bg-[#0f0f1a]/90 p-7 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3 pb-5 border-b border-white/[0.08]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Generation Preferences</h2>
            <p className="text-xs text-white/50">Select the default intelligence engine used for drafting campaigns and posts.</p>
          </div>
        </div>

        <div className="mt-6 max-w-xl space-y-4">
          <div>
            <label htmlFor="ai-provider" className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-white/70">
              Preferred AI Provider
            </label>
            <select
              id="ai-provider"
              value={provider}
              disabled={role === "MEMBER" || busy === "provider"}
              onChange={(event) => void saveProvider(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-[#141428] px-4 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-40 cursor-pointer"
            >
              <option value="auto" className="bg-[#16162a] text-white">Automatic (Best available model)</option>
              <option value="mock" className="bg-[#16162a] text-white">Demo Mode (Built-in mock response)</option>
              <option value="openai" className="bg-[#16162a] text-white">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="anthropic" className="bg-[#16162a] text-white">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="groq" className="bg-[#16162a] text-white">Groq (Llama 3 70B Fast)</option>
            </select>
          </div>
          {role === "MEMBER" && (
            <p className="text-xs text-white/40">Only workspace owners and admins can configure AI provider settings.</p>
          )}
        </div>
      </section>
    </div>
  );
}
