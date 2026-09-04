"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { UserRole } from "@/types/database";
import { switchWorkspace } from "@/lib/workspace/actions";

export function WorkspaceSwitcher({ currentId, workspaces }: { currentId: string; workspaces: { id: string; name: string; role: UserRole }[] }) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const current = workspaces.find((workspace) => workspace.id === currentId) ?? workspaces[0];

  async function select(id: string) {
    if (id === currentId) { setOpen(false); return; }
    setSwitching(true);
    try { await switchWorkspace(id); } catch { setSwitching(false); }
  }

  return (
    <div className="relative">
      <button type="button" disabled={switching} onClick={() => setOpen((value) => !value)} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm disabled:opacity-60">
        <span className="max-w-44 truncate">{current?.name ?? "Workspace"}</span><ChevronDown size={15} className="text-slate-400" />
      </button>
      {open && <>
        <button aria-label="Close workspace menu" className="fixed inset-0 z-10 h-full w-full cursor-default" onClick={() => setOpen(false)} />
        <div className="absolute left-0 top-12 z-20 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <div className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Your workspaces</div>
          {workspaces.map((workspace) => <button key={workspace.id} type="button" onClick={() => void select(workspace.id)} className="flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left hover:bg-slate-50">
            <span><span className="block truncate text-sm font-medium text-slate-900">{workspace.name}</span><span className="text-xs text-slate-500">{workspace.role}</span></span>
            {workspace.id === currentId && <Check size={16} className="text-blue-600" />}
          </button>)}
        </div>
      </>}
    </div>
  );
}
