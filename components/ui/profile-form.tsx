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
      {/* Body */}
      <div className="p-6 sm:p-7 space-y-6">
        {/* Avatar and Identity Preview */}
        <div className="flex items-center gap-4 pb-5 border-b border-white/[0.06]">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white shadow-md text-xl">
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
            <div className="text-sm font-semibold text-white">{name || "Your Account"}</div>
            <div className="text-xs text-white/40 mt-0.5 font-mono">{profile?.email || "No email linked"}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active Account
              </span>
            </div>
          </div>
        </div>

        {/* 2-column input fields */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="display-name" className="block text-xs font-semibold text-white/70 mb-1.5">
              Display Name
            </label>
            <input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Enter your name"
              className="h-10 w-full rounded-xl border border-white/10 bg-[#141426] px-3.5 text-xs sm:text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-white/70">
                Email Address
              </label>
              <span className="text-[11px] text-white/35">Linked to Supabase</span>
            </div>
            <input
              id="email"
              value={profile?.email ?? ""}
              disabled
              className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 text-xs sm:text-sm text-white/40 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        {/* Avatar URL */}
        <div>
          <label htmlFor="avatar-url" className="block text-xs font-semibold text-white/70 mb-1.5">
            Avatar URL <span className="font-normal text-white/40">(optional image URL)</span>
          </label>
          <input
            id="avatar-url"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="h-10 w-full rounded-xl border border-white/10 bg-[#141426] px-3.5 text-xs sm:text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
          <p className="mt-1.5 text-[11px] text-white/40 leading-normal">
            Paste a direct link to a public image (PNG, JPG, or WebP) to use as your customized avatar.
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.015]">
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
            <span className="text-white/40 text-[11px]">Changes will reflect immediately across workspaces.</span>
          )}
        </div>
        <button
          disabled={saving}
          type="submit"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-5 text-xs font-semibold text-white shadow-sm shadow-violet-500/25 hover:bg-violet-500 transition disabled:opacity-40 cursor-pointer"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          <span>{saving ? "Saving..." : "Save changes"}</span>
        </button>
      </div>
    </form>
  );
}
