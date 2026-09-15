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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Toast Feedback */}
      {(message || error) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: error ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
            border: `1px solid ${error ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
            borderRadius: "var(--r-md)",
            color: error ? "#f87171" : "#4ade80",
            fontSize: 13,
          }}
        >
          <span>{error || message}</span>
          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setError(null);
            }}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
          >
            &times;
          </button>
        </div>
      )}

      {/* 1. Workspace Details */}
      {(!filteredSection || filteredSection === "workspace") && (
        <section
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--r-md)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
                flexShrink: 0,
              }}
            >
              <Building2 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Workspace Details
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Customize your brand workspace identifier
              </p>
            </div>
          </div>

          <div style={{ padding: 24, maxWidth: 480 }}>
            <div className="campaign-field-label">
              <span>Workspace Name</span>
            </div>
            <input
              id="workspace-name-input"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              disabled={role === "MEMBER"}
              placeholder="e.g. Acme Studio"
              className="campaign-input"
              style={{ height: 40 }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-elevated)",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {role === "MEMBER" ? "Only workspace admins can rename this workspace." : "Changes apply across all workspace members."}
            </span>
            <button
              type="button"
              onClick={() => void saveWorkspace()}
              disabled={role === "MEMBER" || busy === "workspace" || !name.trim()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: "var(--r-md)",
                background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 700,
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(109,92,255,0.3)",
                opacity: role === "MEMBER" || busy === "workspace" || !name.trim() ? 0.5 : 1,
              }}
            >
              {busy === "workspace" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Save Workspace</span>
            </button>
          </div>
        </section>
      )}

      {/* 2. Team Members & Permissions */}
      {(!filteredSection || filteredSection === "team") && (
        <section
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "var(--r-md)",
                  background: "var(--accent-soft)",
                  border: "1px solid var(--border-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a89dff",
                  flexShrink: 0,
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Team Members &amp; Permissions
                </h2>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  Control role assignments and collaborator privileges
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 99,
                padding: "2px 8px",
              }}
            >
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: "rgba(255,255,255,0.015)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                  }}
                >
                  <th style={{ padding: "12px 24px" }}>Member</th>
                  <th style={{ padding: "12px 24px" }}>Role</th>
                  <th style={{ padding: "12px 24px" }}>Joined</th>
                  <th style={{ padding: "12px 24px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.membership_id}
                    style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s ease" }}
                    className="hover:bg-white/[0.02]"
                  >
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "var(--r-md)",
                            background: "var(--accent-soft)",
                            border: "1px solid var(--border-accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#a89dff",
                            fontSize: 13,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {(member.profile.name || member.profile.email).slice(0, 1).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                            {member.profile.name || "Unnamed member"}
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>
                            {member.profile.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {member.role === "OWNER" ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            borderRadius: 99,
                            border: "1px solid var(--border-accent)",
                            background: "var(--accent-soft)",
                            padding: "2px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#a89dff",
                          }}
                        >
                          <Shield size={11} /> OWNER
                        </span>
                      ) : role === "OWNER" ? (
                        <select
                          aria-label={`Role for ${member.profile.email}`}
                          value={member.role}
                          disabled={busy === member.membership_id}
                          onChange={(e) => void changeRole(member, e.target.value as "ADMIN" | "MEMBER")}
                          className="campaign-input"
                          style={{ height: 32, fontSize: 12, padding: "2px 8px", width: "auto", cursor: "pointer" }}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="MEMBER">MEMBER</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                          {member.role}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {new Date(member.joined_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      {role === "OWNER" && member.role !== "OWNER" && (
                        <button
                          type="button"
                          onClick={() => void remove(member)}
                          disabled={busy === member.membership_id}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            borderRadius: "var(--r-sm)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            background: "rgba(239,68,68,0.1)",
                            padding: "4px 10px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#f87171",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                      {member.role === "OWNER" && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Workspace Owner</span>
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
        <section
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--r-md)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
                flexShrink: 0,
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                AI Generation Preferences
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Select the default intelligence engine used for drafting campaigns and posts
              </p>
            </div>
          </div>

          <div style={{ padding: 24, maxWidth: 480 }}>
            <div className="campaign-field-label">
              <span>Preferred AI Provider</span>
            </div>
            <select
              id="ai-provider-select"
              value={provider}
              disabled={role === "MEMBER" || busy === "provider"}
              onChange={(e) => void saveProvider(e.target.value)}
              className="campaign-input"
              style={{ height: 40, cursor: "pointer" }}
            >
              <option value="auto">Automatic (Best available model)</option>
              <option value="mock">Demo Mode (Built-in mock response)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="groq">Groq (Llama 3 70B Fast)</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-elevated)",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {role === "MEMBER" ? "Only workspace admins can modify AI engine options." : "Auto mode falls back to available providers if rate limits occur."}
            </span>
            {busy === "provider" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                <Loader2 size={13} className="animate-spin" /> Saving...
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
