"use client";

import { useState } from "react";
import { Bot, Building2, Check, Loader2, Shield, Trash2, Users } from "lucide-react";
import type { TeamMember } from "@/lib/workspace/types";
import type { UserRole } from "@/types/database";
import { removeMember, updateMemberRole, updatePreferredAIProvider, updateWorkspace } from "@/lib/workspace/actions";

export function WorkspaceSettings({
  workspace,
  role,
  members,
  filteredSection,
}: {
  workspace: { id: string; name: string; owner_id: string; created_at: string; updated_at: string; ai_provider: string };
  role: UserRole;
  members: TeamMember[];
  filteredSection?: "workspace" | "team" | "ai";
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
    else setMessage("Workspace name updated successfully.");
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
    <div className="space-y-8">
      {/* Toast Feedback */}
      {(message || error) && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium backdrop-blur-xl ${
            error
              ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          <span>{error || message}</span>
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setError(null);
            }}
            className="text-white/40 hover:text-white transition cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* 1. Workspace Details */}
      {(!filteredSection || filteredSection === "workspace") && (
        <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d1a] shadow-xl shadow-black/20 overflow-hidden">
          <div className="flex items-center gap-3.5 px-6 py-5 sm:px-8 sm:py-6 border-b border-white/[0.06] bg-white/[0.015]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
              <Building2 size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">Workspace Details</h2>
              <p className="text-xs text-white/45 mt-0.5">Customize your brand workspace identifier</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-4">
            <div className="max-w-md">
              <label htmlFor="workspace-name-input" className="block text-xs font-medium text-white/70 mb-2">
                Workspace Name
              </label>
              <input
                id="workspace-name-input"
                value={name}
                maxLength={120}
                onChange={(e) => setName(e.target.value)}
                disabled={role === "MEMBER"}
                placeholder="e.g. Acme Studio"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#121222] px-3.5 text-xs sm:text-sm text-white placeholder:text-white/25 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-40"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-4.5 border-t border-white/[0.06] bg-white/[0.01]">
            <span className="text-xs text-white/40">
              {role === "MEMBER" ? "Only workspace admins can rename this workspace." : "Changes apply across all workspace members."}
            </span>
            <button
              type="button"
              onClick={() => void saveWorkspace()}
              disabled={role === "MEMBER" || busy === "workspace" || !name.trim()}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 text-xs font-medium text-white shadow-sm transition disabled:opacity-40 cursor-pointer"
            >
              {busy === "workspace" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Save Workspace</span>
            </button>
          </div>
        </section>
      )}

      {/* 2. Team Members & Permissions */}
      {(!filteredSection || filteredSection === "team") && (
        <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d1a] shadow-xl shadow-black/20 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6 border-b border-white/[0.06] bg-white/[0.015]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
                <Users size={16} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white">Team Members &amp; Permissions</h2>
                <p className="text-xs text-white/45 mt-0.5">Control role assignments and collaborator privileges</p>
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-white/60">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01] text-[10.5px] uppercase tracking-wider font-semibold text-white/40">
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {members.map((member) => (
                  <tr key={member.membership_id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/25 text-xs font-semibold">
                          {(member.profile.name || member.profile.email).slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs sm:text-sm font-medium text-white">
                            {member.profile.name || "Unnamed member"}
                          </div>
                          <div className="truncate text-[11px] text-white/40 font-mono mt-0.5">{member.profile.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.role === "OWNER" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">
                          <Shield size={11} /> OWNER
                        </span>
                      ) : role === "OWNER" ? (
                        <select
                          aria-label={`Role for ${member.profile.email}`}
                          value={member.role}
                          disabled={busy === member.membership_id}
                          onChange={(e) => void changeRole(member, e.target.value as "ADMIN" | "MEMBER")}
                          className="h-7 rounded-md border border-white/10 bg-[#121222] px-2 text-xs font-medium text-white outline-none cursor-pointer focus:border-violet-500"
                        >
                          <option value="ADMIN" className="bg-[#121222] text-white">ADMIN</option>
                          <option value="MEMBER" className="bg-[#121222] text-white">MEMBER</option>
                        </select>
                      ) : (
                        <span className="text-xs font-medium text-white/70">{member.role}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-white/40 font-mono">
                      {new Date(member.joined_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {role === "OWNER" && member.role !== "OWNER" && (
                        <button
                          type="button"
                          onClick={() => void remove(member)}
                          disabled={busy === member.membership_id}
                          className="inline-flex h-7 items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-2.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 size={12} /> Remove
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
        </section>
      )}

      {/* 3. AI Settings */}
      {(!filteredSection || filteredSection === "ai") && (
        <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d1a] shadow-xl shadow-black/20 overflow-hidden">
          <div className="flex items-center gap-3.5 px-6 py-5 sm:px-8 sm:py-6 border-b border-white/[0.06] bg-white/[0.015]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
              <Bot size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">AI Generation Preferences</h2>
              <p className="text-xs text-white/45 mt-0.5">Select the default intelligence engine used for drafting campaigns and posts</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-4">
            <div className="max-w-md">
              <label htmlFor="ai-provider-select" className="block text-xs font-medium text-white/70 mb-2">
                Preferred AI Provider
              </label>
              <select
                id="ai-provider-select"
                value={provider}
                disabled={role === "MEMBER" || busy === "provider"}
                onChange={(e) => void saveProvider(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#121222] px-3.5 text-xs sm:text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-40 cursor-pointer"
              >
                <option value="auto" className="bg-[#121222] text-white">Automatic (Best available model)</option>
                <option value="mock" className="bg-[#121222] text-white">Demo Mode (Built-in mock response)</option>
                <option value="openai" className="bg-[#121222] text-white">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="anthropic" className="bg-[#121222] text-white">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="groq" className="bg-[#121222] text-white">Groq (Llama 3 70B Fast)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-4.5 border-t border-white/[0.06] bg-white/[0.01]">
            <span className="text-xs text-white/40">
              {role === "MEMBER" ? "Only workspace admins can modify AI engine options." : "Auto mode falls back to available providers if rate limits occur."}
            </span>
            {busy === "provider" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-violet-300 font-medium">
                <Loader2 size={13} className="animate-spin" /> Saving...
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
