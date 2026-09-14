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
    <form onSubmit={submit} className="space-y-8">
      {/* Profile Header Avatar preview */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-2">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-white shadow-xl text-2xl">
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
          <div className="text-lg font-semibold text-white">{name || "Your Name"}</div>
          <div className="text-sm text-white/50 mt-0.5">{profile?.email || "No email linked"}</div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active Account
            </span>
          </div>
        </div>
      </div>

      {/* 2-column input fields with generous spacing */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2.5 block text-sm font-medium text-white/80">
            Display Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Enter your display name"
            className="h-13 w-full rounded-2xl border border-white/10 bg-[#16162e] px-4 sm:px-5 text-sm text-white placeholder:text-white/35 outline-none transition duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
          />
        </div>

        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <label htmlFor="email" className="block text-sm font-medium text-white/80">
              Email Address
            </label>
            <span className="text-xs text-white/40">Linked to Supabase</span>
          </div>
          <input
            id="email"
            value={profile?.email ?? ""}
            disabled
            className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 sm:px-5 text-sm text-white/40 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label htmlFor="avatar" className="mb-2.5 block text-sm font-medium text-white/80">
          Avatar URL <span className="font-normal text-white/40">(optional image URL)</span>
        </label>
        <input
          id="avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="h-13 w-full rounded-2xl border border-white/10 bg-[#16162e] px-4 sm:px-5 text-sm text-white placeholder:text-white/35 outline-none transition duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
        />
        <p className="mt-2 text-xs text-white/40 leading-relaxed">
          Paste a direct link to a public image (PNG, JPG, or WebP) to use as your customized user avatar.
        </p>
      </div>

      <div className="flex items-center gap-5 pt-6 border-t border-white/[0.08]">
        <button
          disabled={saving}
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition duration-200 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Saving changes..." : "Save changes"}
        </button>
        {status && (
          <span
            className={`text-sm font-medium ${
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
