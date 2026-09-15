"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
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
    <form onSubmit={submit} className="flex flex-col">
      {/* Form Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Avatar + Identity Summary Row */}
        <div className="flex items-center gap-4 sm:gap-5 pb-6 border-b border-white/[0.06]">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white text-lg shadow-sm">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span>{initialLetter}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-sm sm:text-base font-semibold text-white truncate">
                {name || "Your Account"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active Account
              </span>
            </div>
            <p className="text-xs text-white/40 font-mono mt-0.5 truncate">
              {profile?.email || "No email linked"}
            </p>
          </div>
        </div>

        {/* 2-Column Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="display-name" className="block text-xs font-medium text-white/70 mb-2">
              Display Name
            </label>
            <input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Alex Smith"
              className="h-10 w-full rounded-lg border border-white/10 bg-[#121222] px-3.5 text-xs sm:text-sm text-white placeholder:text-white/25 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="email" className="block text-xs font-medium text-white/70">
                Email Address
              </label>
              <span className="text-[11px] text-white/35">Managed by Auth</span>
            </div>
            <input
              id="email"
              value={profile?.email ?? ""}
              disabled
              className="h-10 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 text-xs sm:text-sm text-white/40 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        {/* Avatar URL Field */}
        <div>
          <label htmlFor="avatar-url" className="block text-xs font-medium text-white/70 mb-2">
            Avatar Image URL <span className="font-normal text-white/40">(optional public image URL)</span>
          </label>
          <input
            id="avatar-url"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="h-10 w-full rounded-lg border border-white/10 bg-[#121222] px-3.5 text-xs sm:text-sm text-white placeholder:text-white/25 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
          <p className="mt-2 text-[11.5px] text-white/40 leading-relaxed">
            Provide a direct public link to a PNG, JPG, or WebP image to display as your user avatar across posts and comments.
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 sm:px-8 sm:py-4.5 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
        <div className="text-xs">
          {status ? (
            <span
              className={`font-medium ${
                status.type === "success" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {status.text}
            </span>
          ) : (
            <span className="text-white/40 text-xs">Profile updates sync across all workspaces.</span>
          )}
        </div>
        <button
          disabled={saving}
          type="submit"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 text-xs font-medium text-white shadow-sm transition disabled:opacity-40 cursor-pointer"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          <span>{saving ? "Saving..." : "Save changes"}</span>
        </button>
      </div>
    </form>
  );
}
