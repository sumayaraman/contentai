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
      {/* Spacious Card Body */}
      <div className="p-8 sm:p-9 space-y-8">
        {/* Avatar and Identity Preview */}
        <div className="flex items-center gap-5 pb-8 border-b border-white/[0.06]">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white shadow-lg text-2xl">
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
            <div className="text-base font-semibold text-white">{name || "Your Account"}</div>
            <div className="text-xs text-white/45 mt-1 font-mono">{profile?.email || "No email linked"}</div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active Account
              </span>
            </div>
          </div>
        </div>

        {/* 2-column input fields with generous spacing */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          <div>
            <label htmlFor="display-name" className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2.5">
              Display Name
            </label>
            <input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Enter your name"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#151528] px-4 text-sm text-white placeholder:text-white/30 outline-none transition duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                Email Address
              </label>
              <span className="text-[11px] text-white/35">Linked to Supabase</span>
            </div>
            <input
              id="email"
              value={profile?.email ?? ""}
              disabled
              className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-sm text-white/40 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        {/* Avatar URL */}
        <div className="space-y-1">
          <label htmlFor="avatar-url" className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2.5">
            Avatar URL <span className="font-normal text-white/40 normal-case">(optional public image URL)</span>
          </label>
          <input
            id="avatar-url"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            className="h-11 w-full rounded-xl border border-white/10 bg-[#151528] px-4 text-sm text-white placeholder:text-white/30 outline-none transition duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
          />
          <p className="pt-1.5 text-xs text-white/45 leading-relaxed">
            Paste a direct link to a public image (PNG, JPG, or WebP) to use as your customized avatar.
          </p>
        </div>
      </div>

      {/* Spacious Card Footer */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-white/[0.06] bg-white/[0.015]">
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
            <span className="text-white/40 text-xs">Changes will reflect immediately across workspaces.</span>
          )}
        </div>
        <button
          disabled={saving}
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-xs font-semibold text-white shadow-md shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-40 cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          <span>{saving ? "Saving..." : "Save changes"}</span>
        </button>
      </div>
    </form>
  );
}
