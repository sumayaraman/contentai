"use client";

import { useState } from "react";
import { Bot, Building2, Globe, Settings as SettingsIcon, User, Users } from "lucide-react";
import { ProfileForm } from "@/components/ui/profile-form";
import { WorkspaceSettings } from "@/components/workspace/workspace-settings";
import { SocialAccounts } from "@/components/workspace/social-accounts";
import type { TeamMember } from "@/lib/workspace/types";
import type { UserProfile, UserRole } from "@/types/database";
import type { SocialAccount } from "@/lib/social/types";

type SettingsTab = "profile" | "workspace" | "team" | "ai" | "social" | "all";

const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "team", label: "Team Access", icon: Users },
  { id: "ai", label: "AI Engine", icon: Bot },
  { id: "social", label: "Social Accounts", icon: Globe },
  { id: "all", label: "View All", icon: SettingsIcon },
];

export function SettingsContainer({
  profile,
  workspace,
  role,
  members,
  socialAccounts,
}: {
  profile: UserProfile | null;
  workspace: { id: string; name: string; owner_id: string; created_at: string; updated_at: string; ai_provider: string };
  role: UserRole;
  members: TeamMember[];
  socialAccounts: SocialAccount[];
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Studio Tab Navigation */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: 6,
          overflowX: "auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`studio-tab-btn ${isActive ? "active" : ""}`}
              style={{
                flexShrink: 0,
                padding: "8px 16px",
                fontSize: 13,
                borderRadius: "var(--r-md)",
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Profile Tab */}
        {(activeTab === "profile" || activeTab === "all") && (
          <div
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
                  <User size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    Personal Profile
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                    Your avatar and display name across post revisions and activity feeds
                  </p>
                </div>
              </div>
            </div>
            <ProfileForm profile={profile} />
          </div>
        )}

        {/* Workspace, Team, AI sections via WorkspaceSettings */}
        {(activeTab === "workspace" || activeTab === "team" || activeTab === "ai" || activeTab === "all") && (
          <WorkspaceSettings
            workspace={workspace}
            role={role}
            members={members}
            filteredSection={activeTab === "all" ? undefined : activeTab}
          />
        )}

        {/* Social Accounts Tab */}
        {(activeTab === "social" || activeTab === "all") && (
          <SocialAccounts accounts={socialAccounts} role={role} />
        )}
      </div>
    </div>
  );
}
