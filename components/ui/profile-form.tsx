"use client";

import { useState } from "react";
import { Check, Loader2, User } from "lucide-react";
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
    <form onSubmit={submit} className="space-y-6">
      {/* Profile Header Avatar preview */}
      <div className="flex items-center gap-5 pb-2">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white shadow-lg text-xl">
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
          <div className="text-base font-semibold text-white">{name || "Your Name"}</div>
          <div className="text-xs text-white/50">{profile?.email || "No email"}</div>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            Active Account
          </span>
        </div>
      </div>

      {/* 2-column input fields */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/70">
            Display Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Enter your display name"
            className="h-12 w-full rounded-xl border border-white/10 bg-[#141428] px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-white/70">
              Email Address
            </label>
            <span className="text-[11px] text-white/40">Verified via Auth</span>
          </div>
          <input
            id="email"
            value={profile?.email ?? ""}
            disabled
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/40 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label htmlFor="avatar" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/70">
          Avatar URL <span className="font-normal text-white/40 lowercase">(optional public image URL)</span>
        </label>
        <input
          id="avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="h-12 w-full rounded-xl border border-white/10 bg-[#141428] px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
        <p className="mt-1.5 text-xs text-white/40">
          Provide a link to an image (JPG, PNG, or WebP) to display as your custom user avatar.
        </p>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-white/[0.08]">
        <button
          disabled={saving}
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
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
