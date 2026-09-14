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
      <button
        type="button"
        disabled={switching}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-[#16162a] px-3 text-xs font-medium text-white shadow-sm transition hover:border-violet-500/30 hover:bg-[#1a1a32] disabled:opacity-60 cursor-pointer"
      >
        <span className="max-w-44 truncate">{current?.name ?? "Workspace"}</span>
        <ChevronDown size={14} className="text-white/40" />
      </button>
      {open && (
        <>
          <button aria-label="Close workspace menu" className="fixed inset-0 z-10 h-full w-full cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-11 z-20 w-72 rounded-2xl border border-white/10 bg-[#0f0f1a] p-1.5 shadow-2xl backdrop-blur-2xl">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Your workspaces</div>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                onClick={() => void select(workspace.id)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/[0.05]"
              >
                <span>
                  <span className="block truncate text-xs font-medium text-white/90">{workspace.name}</span>
                  <span className="text-[10px] text-white/40">{workspace.role}</span>
                </span>
                {workspace.id === currentId && <Check size={14} className="text-violet-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

