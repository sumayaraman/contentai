"use client";

import { useState } from "react";
import { Bot, Building2, Globe, Settings as SettingsIcon, Shield, User, Users } from "lucide-react";
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
    <div className="space-y-8">
      {/* Tab Navigation Bar */}
      <div className="flex items-center overflow-x-auto pb-1 border-b border-white/[0.08] gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 scale-[1.02]"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="space-y-10">
        {/* Profile Tab */}
        {(activeTab === "profile" || activeTab === "all") && (
          <div className="rounded-3xl border border-white/[0.08] bg-[#101020]/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/40 space-y-8">
            <div className="pb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Personal Profile</h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Your avatar and name appear across all post revisions and activity feeds.
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
