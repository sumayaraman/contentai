"use client";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 8rem)", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ width: "100%", maxWidth: 600, borderRadius: 16, border: "1px solid rgba(255,0,0,0.3)", background: "rgba(255,0,0,0.05)", padding: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "red", fontWeight: 700, fontSize: 20, marginBottom: 16 }}>!</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0f0ff", margin: "0 0 8px" }}>Something went wrong</h1>
        <pre style={{ fontSize: 12, color: "#f87171", whiteSpace: "pre-wrap", wordBreak: "break-all", background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          {error?.message || "Unknown error"}{"\n\n"}{error?.stack || ""}
        </pre>
        <button onClick={reset} style={{ borderRadius: 8, background: "#1e1e2e", padding: "10px 20px", fontSize: 13, fontWeight: 600, color: "#f0f0ff", cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)" }}>Try again</button>
      </div>
    </div>
  );
}
