"use client";

import { useState } from "react";
import { Loader2, User } from "lucide-react";
import type { UserProfile } from "@/types/database";
import { updateProfile } from "@/lib/auth/update-profile";

export function ProfileForm({ profile }: { profile: UserProfile | null }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    const result = await updateProfile({ name, avatarUrl });
    setSaving(false);
    if (result.error) {
      setStatus({ type: "error", text: result.error });
    } else {
      setStatus({ type: "success", text: "Profile updated successfully." });
    }
  }

  const initialLetter = (name || profile?.email || "U").charAt(0).toUpperCase();

  return (
    <form onSubmit={submit} className="max-w-xl space-y-5">
      {/* Profile Header Avatar preview */}
      <div className="flex items-center gap-4 pb-2">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white shadow-md text-lg">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span>{initialLetter}</span>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{name || "Your Name"}</div>
          <div className="text-xs text-white/50">{profile?.email || "No email"}</div>
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
          Email Address
        </label>
        <input
          id="email"
          value={profile?.email ?? ""}
          disabled
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 text-xs text-white/40 cursor-not-allowed"
        />
        <p className="mt-1 text-[11px] text-white/40">Email is linked to your authentication provider.</p>
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
          Display Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Enter your name"
          className="h-10 w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 text-xs text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>

      <div>
        <label htmlFor="avatar" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/60">
          Avatar URL <span className="font-normal text-white/40 lowercase">(optional image URL)</span>
        </label>
        <input
          id="avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="h-10 w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 text-xs text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          disabled={saving}
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Saving changes..." : "Save changes"}
        </button>
        {status && (
          <span
            className={`text-xs font-medium ${
              status.type === "success" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {status.text}
          </span>
        )}
      </div>
    </form>
  );
}
