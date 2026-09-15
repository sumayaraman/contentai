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
    <div className="space-y-6">
      {/* Sleek Segmented Tab Navigation Bar */}
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08] max-w-full overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-500/25"
                  : "text-white/50 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="space-y-6">
        {/* Profile Tab */}
        {(activeTab === "profile" || activeTab === "all") && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 backdrop-blur-xl shadow-xl shadow-black/25 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.015]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
                <User size={15} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Personal Profile</h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Your avatar and display name visible across post revisions and activity logs
                </p>
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
