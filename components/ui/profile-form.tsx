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
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column" }}>
      {/* Form Content */}
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Avatar + Identity Summary Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            paddingBottom: 20,
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 56,
              height: 56,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border-accent)",
              background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
              fontWeight: 800,
              color: "#ffffff",
              fontSize: 20,
              boxShadow: "0 4px 16px rgba(109,92,255,0.3)",
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span>{initialLetter}</span>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                {name || "Your Account"}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 99,
                  border: "1px solid rgba(16,185,129,0.25)",
                  background: "rgba(16,185,129,0.1)",
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#34d399",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#34d399" }} /> Active Account
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", margin: "4px 0 0" }}>
              {profile?.email || "No email linked"}
            </p>
          </div>
        </div>

        {/* 2-Column Inputs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <div>
            <div className="campaign-field-label">
              <span>Display Name</span>
            </div>
            <input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Alex Smith"
              className="campaign-input"
              style={{ height: 40 }}
            />
          </div>

          <div>
            <div className="campaign-field-label">
              <span>Email Address</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "none" }}>Managed by Auth</span>
            </div>
            <input
              id="email"
              value={profile?.email ?? ""}
              disabled
              className="campaign-input"
              style={{ height: 40, opacity: 0.6, cursor: "not-allowed", fontFamily: "monospace" }}
            />
          </div>
        </div>

        {/* Avatar URL Field */}
        <div>
          <div className="campaign-field-label">
            <span>Avatar Image URL</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "none" }}>(optional public URL)</span>
          </div>
          <input
            id="avatar-url"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="campaign-input"
            style={{ height: 40 }}
          />
          <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
            Provide a direct public link to a PNG, JPG, or WebP image to display as your user avatar across posts and comments.
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg-elevated)",
        }}
      >
        <div style={{ fontSize: 12 }}>
          {status ? (
            <span style={{ fontWeight: 600, color: status.type === "success" ? "#34d399" : "#f87171" }}>
              {status.text}
            </span>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>Profile updates sync across all workspaces.</span>
          )}
        </div>
        <button
          disabled={saving}
          type="submit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: "var(--r-md)",
            background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 700,
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(109,92,255,0.3)",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          <span>{saving ? "Saving..." : "Save changes"}</span>
        </button>
      </div>
    </form>
  );
}
