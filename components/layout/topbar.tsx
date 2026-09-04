"use client";

import { Bell, Search } from "lucide-react";
import type { UserProfile, UserRole } from "@/types/database";
import { signOut } from "@/lib/auth/sign-out";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";

export function Topbar({ profile, workspaceId, workspaces }: { profile: UserProfile | null; workspaceId: string; workspaces: { id: string; name: string; role: UserRole }[] }) {
  const initials = (profile?.name || profile?.email || "U").slice(0, 1).toUpperCase();
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <WorkspaceSwitcher currentId={workspaceId} workspaces={workspaces} />
        <div className="hidden h-5 w-px bg-slate-200 sm:block" />
        <div className="relative hidden md:block"><Search size={17} className="absolute left-3 top-2.5 text-slate-400" /><input aria-label="Search" placeholder="Search workspace..." className="h-10 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white" /></div>
      </div>
      <div className="flex items-center gap-2"><button aria-label="Notifications" className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-50"><Bell size={19} /></button><div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{initials}</div><div className="hidden max-w-32 sm:block"><div className="truncate text-sm font-semibold text-slate-900">{profile?.name || "Account"}</div><div className="truncate text-xs text-slate-500">{profile?.email}</div></div><form action={signOut}><button className="ml-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900">Log out</button></form></div></div>
    </header>
  );
}
