"use client";

import { useState } from "react";
import { CheckCircle2, Globe, Link2, Loader2, LogOut, ShieldAlert } from "lucide-react";
import type { Platform } from "@/types/database";
import type { SocialAccount } from "@/lib/social/types";
import { disconnectAccount } from "@/lib/social/actions";

const platforms: { key: Platform; name: string; connect: string; note: string }[] = [
  { key: "INSTAGRAM", name: "Instagram", connect: "/api/social/meta/connect", note: "Connect a Meta professional account for feed and story publishing." },
  { key: "FACEBOOK", name: "Facebook", connect: "/api/social/meta/connect", note: "Publish directly to company Pages and brand channels." },
  { key: "LINKEDIN", name: "LinkedIn", connect: "/api/social/linkedin/connect", note: "Publish articles and updates using official LinkedIn OAuth." },
  { key: "X", name: "X", connect: "/api/social/x/connect", note: "Post status updates, threads, and media via X OAuth 2.0." },
];

export function SocialAccounts({ accounts, role, notice }: { accounts: SocialAccount[]; role: "OWNER" | "ADMIN" | "MEMBER"; notice?: string | null }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function disconnect(id: string) {
    if (!window.confirm("Disconnect this social account? Existing publication history will remain.")) return;
    setBusy(id);
    await disconnectAccount(id);
    setBusy(null);
    window.location.reload();
  }

  return (
    <section
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "20px 24px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "var(--r-md)",
              background: "var(--accent-soft)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a89dff",
              flexShrink: 0,
            }}
          >
            <Globe size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Connected Social Accounts
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
              Authorize real social platforms for one-click publishing
            </p>
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 99,
            border: "1px solid rgba(245,158,11,0.25)",
            background: "rgba(245,158,11,0.1)",
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 600,
            color: "#fbbf24",
          }}
        >
          <ShieldAlert size={12} /> Demo Simulation Available
        </span>
      </div>

      {notice && (
        <div style={{ margin: "20px 24px 0", padding: "12px 16px", borderRadius: "var(--r-md)", border: "1px solid var(--border-accent)", background: "var(--accent-soft)", fontSize: 12, color: "var(--text-primary)" }}>
          {notice}
        </div>
      )}

      <div style={{ padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {platforms.map((platform) => {
            const account = accounts.find((item) => item.platform === platform.key);
            return (
              <div
                key={platform.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: "var(--r-lg)",
                  border: "1px solid var(--border)",
                  background: "var(--bg-elevated)",
                  padding: 20,
                  transition: "border-color 0.15s ease",
                }}
                className="hover:border-violet-500/30"
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                      {platform.name}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
                      {account ? `${account.account_name}${account.username ? ` · @${account.username}` : ""}` : platform.note}
                    </p>
                  </div>
                  {account ? (
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CheckCircle2 size={15} />
                    </span>
                  ) : (
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Link2 size={14} />
                    </span>
                  )}
                </div>

                <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {account ? (
                    <button
                      type="button"
                      disabled={role === "MEMBER" || busy === account.id}
                      onClick={() => void disconnect(account.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: "var(--r-sm)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        background: "rgba(239,68,68,0.1)",
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#f87171",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {busy === account.id ? <Loader2 className="animate-spin" size={12} /> : <LogOut size={12} />}
                      <span>Disconnect</span>
                    </button>
                  ) : role === "MEMBER" ? (
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Ask a workspace admin to connect.</span>
                  ) : (
                    <a
                      href={platform.connect}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: "var(--r-md)",
                        background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
                        padding: "8px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#ffffff",
                        textDecoration: "none",
                        boxShadow: "0 4px 16px rgba(109,92,255,0.3)",
                      }}
                    >
                      <Link2 size={13} />
                      <span>Connect {platform.name}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
