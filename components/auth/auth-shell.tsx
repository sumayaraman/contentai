"use client";
import { Sparkles } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const features = [
  "AI content generation in seconds",
  "Multi-platform scheduling & publishing",
  "Smart editorial calendar",
  "Analytics that drive growth",
  "Campaign planning & automation",
];

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-page">
      {/* Left dark panel */}
      <div className="auth-left">
        {/* Ambient orbs */}
        <div className="orb orb-violet" style={{
          width: 280, height: 280, top: -80, left: -80,
          position: "absolute", animation: "orb-drift 14s ease-in-out infinite"
        }} />
        <div className="orb orb-purple" style={{
          width: 180, height: 180, bottom: 60, right: -60,
          position: "absolute", animation: "orb-drift 18s ease-in-out infinite reverse"
        }} />

        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          position: "relative", zIndex: 1,
        }}>
          <div className="sb-logo-icon">
            <Sparkles size={15} />
          </div>
          <span style={{
            fontSize: 15, fontWeight: 650,
            color: "var(--text-primary)", letterSpacing: "-0.02em"
          }}>
            ContentAI
          </span>
        </div>

        {/* Headline */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", position: "relative", zIndex: 1
        }}>
          <div className="ai-dot" style={{ marginBottom: 16 }} />
          <h2 style={{
            fontSize: 26, fontWeight: 700, color: "var(--text-primary)",
            letterSpacing: "-0.03em", lineHeight: 1.3, marginBottom: 12,
          }}>
            Your AI-powered content command centre.
          </h2>
          <p style={{
            fontSize: 13.5, color: "var(--text-secondary)",
            lineHeight: 1.7, marginBottom: 32
          }}>
            Plan, generate, schedule and publish content across every platform — all from one intelligent workspace.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {features.map((f, i) => (
              <div
                key={f}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  animation: `fade-up 0.4s ease ${0.1 + i * 0.07}s forwards`,
                  opacity: 0,
                }}
              >
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 8px var(--accent)",
                  flexShrink: 0,
                  animation: "pulse-glow 2.5s ease-in-out infinite",
                }} />
                <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
            © 2025 ContentAI — Phase 1 Foundation
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-box" style={{
          animation: "fade-up 0.4s ease forwards", opacity: 0
        }}>
          {/* Logo — shown on mobile too */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 36 }}>
            <div className="sb-logo-icon">
              <Sparkles size={14} />
            </div>
            <span style={{
              fontSize: 15, fontWeight: 650,
              color: "var(--text-primary)", letterSpacing: "-0.02em"
            }}>
              ContentAI
            </span>
          </div>

          <h1 style={{
            fontSize: 24, fontWeight: 700, color: "var(--text-primary)",
            letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 6
          }}>
            {title}
          </h1>
          <p style={{
            fontSize: 13.5, color: "var(--text-secondary)",
            lineHeight: 1.6, marginBottom: 28
          }}>
            {subtitle}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}
