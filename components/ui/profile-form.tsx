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
    event.preventDefault(); setSaving(true); setStatus(null);
    const result = await updateProfile({ name, avatarUrl });
    setSaving(false); setStatus(result.error ?? "Profile saved.");
  }

  return <form onSubmit={submit} className="space-y-5"><div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label><input id="email" value={profile?.email ?? ""} disabled className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" /></div><div><label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">Name</label><input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div><div><label htmlFor="avatar" className="mb-2 block text-sm font-medium text-slate-700">Avatar URL <span className="font-normal text-slate-400">(optional)</span></label><input id="avatar" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /></div><div className="flex items-center gap-3"><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>{status && <span className={`text-sm ${status === "Profile saved." ? "text-emerald-600" : "text-red-600"}`}>{status}</span>}</div></form>;
}
