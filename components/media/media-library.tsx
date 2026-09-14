"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ImagePlus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  ExternalLink,
} from "lucide-react";
import { deleteMedia, uploadMedia } from "@/lib/content/media-actions";
import type { Media } from "@/types/database";

export function MediaLibrary({ media }: { media: Media[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1360, margin: "0 auto", width: "100%" }}>
      {/* Upload Zone Card */}
      <form
        action={async (formData: FormData) => {
          setMessage("");
          setError("");
          startTransition(async () => {
            const result = await uploadMedia(formData);
            if (!result.ok) {
              setError(result.error || "Upload failed.");
            } else {
              setMessage(
                result.storageBacked
                  ? "Image uploaded successfully to your media library."
                  : "Image saved in fallback mode (ready to attach to posts)."
              );
            }
          });
        }}
        style={{
          background: "var(--bg-surface)",
          border: "1px dashed rgba(109,92,255,0.35)",
          borderRadius: "var(--r-xl)",
          padding: "24px 28px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
          className="sm:flex-row"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 46,
                height: 46,
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
              <UploadCloud size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Upload an Asset
              </h2>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "3px 0 0" }}>
                Supports JPG, PNG, WebP, or GIF up to 5 MB.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", width: "100%", gap: 10 }} className="sm:w-auto">
            <input
              required
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{
                borderRadius: "var(--r-md)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                padding: "8px 12px",
                fontSize: 12.5,
                color: "var(--text-secondary)",
                outline: "none",
                flex: 1,
              }}
            />
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
              style={{ padding: "8px 18px", fontSize: 13, gap: 6, flexShrink: 0 }}
            >
              <ImagePlus size={15} />
              {isPending ? "Uploading…" : "Upload"}
            </button>
          </div>
        </div>
      </form>

      {/* Notifications */}
      {message && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "var(--r-md)",
            color: "#4ade80",
            fontSize: 13,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage("")}
            style={{ background: "transparent", border: "none", color: "#4ade80", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "var(--r-md)",
            color: "#f87171",
            fontSize: 13,
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Media Grid / Empty State */}
      {media.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: "64px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "rgba(109,92,255,0.1)",
              border: "1px solid rgba(109,92,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#a89dff",
              marginBottom: 16,
            }}
          >
            <ImagePlus size={24} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Your Media Library is Empty
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              maxWidth: 420,
              margin: "8px 0 24px",
              lineHeight: 1.6,
            }}
          >
            Upload images from your computer above or generate custom branded artwork with AI to use in your social posts.
          </p>
          <Link
            href="/image-studio"
            className="btn btn-primary btn-sm"
            style={{ gap: 6, padding: "9px 18px" }}
          >
            <Sparkles size={14} /> Generate with AI Studio
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {media.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-lg)",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.15s ease, transform 0.15s ease",
              }}
            >
              {/* Preview Thumbnail */}
              <div
                style={{
                  aspectRatio: "1",
                  width: "100%",
                  background: "#000",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.file_name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <ImagePlus size={32} style={{ color: "var(--text-muted)" }} />
                )}
              </div>

              {/* Meta & Actions */}
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, flex: 1, justifyContent: "space-between" }}>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={item.file_name}
                  >
                    {item.file_name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      {formatBytes(item.file_size)}
                    </span>
                    <span
                      className="badge"
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        background:
                          item.source === "AI_GENERATED"
                            ? "rgba(109,92,255,0.15)"
                            : "rgba(255,255,255,0.05)",
                        color: item.source === "AI_GENERATED" ? "#c084fc" : "var(--text-secondary)",
                        border:
                          item.source === "AI_GENERATED"
                            ? "1px solid rgba(109,92,255,0.3)"
                            : "1px solid var(--border)",
                      }}
                    >
                      {item.source === "DEMO_FALLBACK"
                        ? "Demo"
                        : item.source === "AI_GENERATED"
                        ? "AI Generated"
                        : "Stored"}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <form
                  action={async (formData: FormData) => {
                    if (!window.confirm(`Delete ${item.file_name}?`)) return;
                    startTransition(async () => {
                      const result = await deleteMedia(formData);
                      if (!result.ok) setError(result.error || "Could not delete media.");
                      else setMessage("Media deleted successfully.");
                    });
                  }}
                  style={{ marginTop: 6 }}
                >
                  <input type="hidden" name="media_id" value={item.id} />
                  <button
                    type="submit"
                    className="btn btn-ghost btn-sm"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 11.5,
                      color: "var(--red)",
                      borderColor: "rgba(239,68,68,0.2)",
                    }}
                  >
                    <Trash2 size={13} /> Delete Asset
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

