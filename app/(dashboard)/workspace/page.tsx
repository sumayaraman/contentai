"use client";

export default function WorkspaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page animate-fade-up">
      <div style={{ padding: 40, color: "red", fontSize: 14, fontFamily: "monospace", whiteSpace: "pre-wrap", background: "rgba(255,0,0,0.05)", borderRadius: 12, border: "1px solid rgba(255,0,0,0.2)" }}>
        <strong>Error:</strong> {error?.message || "Unknown error"}
        {"\n\n"}
        <strong>Stack:</strong> {error?.stack || "No stack"}
        {"\n\n"}
        <button onClick={reset} style={{ padding: "8px 16px", background: "#6d5cff", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Try again</button>
      </div>
    </div>
  );
}
