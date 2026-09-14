"use client";

import { useState } from "react";
import type { UserProfile } from "@/types/database";
import { updateProfile } from "@/lib/auth/update-profile";

export function ProfileForm({ profile }: { profile: UserProfile | null }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    const result = await updateProfile({ name, avatarUrl });
    setSaving(false);
    setStatus(result.error ?? "Profile saved.");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-white/70">Email</label>
        <input
          id="email"
          value={profile?.email ?? ""}
          disabled
          className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-xs text-white/40 cursor-not-allowed"
        />
      </div>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-white/70">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500"
        />
      </div>
      <div>
        <label htmlFor="avatar" className="mb-1.5 block text-xs font-medium text-white/70">
          Avatar URL <span className="font-normal text-white/40">(optional)</span>
        </label>
        <input
          id="avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500"
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {status && (
          <span className={`text-xs font-medium ${status === "Profile saved." ? "text-emerald-400" : "text-rose-400"}`}>
            {status}
          </span>
        )}
      </div>
    </form>
  );
}

