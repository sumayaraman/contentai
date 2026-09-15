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
    <div className="space-y-8">
      {/* Clean SaaS Underline Subnavigation */}
      <div className="flex items-center gap-1 sm:gap-6 border-b border-white/[0.08] overflow-x-auto scrollbar-none -mt-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3.5 pt-1 text-xs sm:text-sm font-medium transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                isActive
                  ? "border-violet-500 text-white font-semibold"
                  : "border-transparent text-white/50 hover:text-white/80 hover:border-white/20"
              }`}
            >
              <Icon size={15} className={isActive ? "text-violet-400" : "text-white/40"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-8">
        {/* Profile Tab */}
        {(activeTab === "profile" || activeTab === "all") && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d1a] shadow-xl shadow-black/20 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6 border-b border-white/[0.06] bg-white/[0.015]">
              <div className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  <User size={16} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-white">Personal Profile</h2>
                  <p className="text-xs text-white/45 mt-0.5">
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
