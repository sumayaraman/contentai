"use client";
/* eslint-disable @next/next/no-img-element */

import { useActionState, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  ImagePlus,
  Save,
  Trash2,
  Copy,
  ArrowLeft,
  CalendarDays,
  FileText,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { createPost, updatePost, deletePost, duplicatePost } from "@/lib/content/actions";
import type { Category, Media, Post, PostStatus } from "@/types/database";
import { platformLabels } from "@/components/posts/platform-badge";

const initialState = { ok: true, errors: {} as Record<string, string> };

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function PostEditor({
  post,
  categories,
  media,
  initialScheduledAt,
  initialStatus,
}: {
  post: Post | null;
  categories: Category[];
  media: Media[];
  initialScheduledAt?: string | null;
  initialStatus?: PostStatus;
}) {
  const action = post ? updatePost : createPost;
  const [state, formAction, pending] = useActionState(async (_previous: typeof initialState, formData: FormData) => {
    const scheduled = formData.get("scheduled_at");
    if (typeof scheduled === "string" && scheduled) {
      const parsed = new Date(scheduled);
      if (!Number.isNaN(parsed.getTime())) formData.set("scheduled_at", parsed.toISOString());
    }
    return action(formData);
  }, initialState);
  const [imageUrl, setImageUrl] = useState(post?.image_url || "");
  const [preview, setPreview] = useState(post?.image_url || "");

  return (
    <>
      <form id="post-editor-form" action={formAction} className="campaign-container" style={{ paddingBottom: 110 }}>
        {post && <input type="hidden" name="post_id" value={post.id} />}

        {/* Global / Form Error Alert */}
        {state.errors.form && (
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
            <span>{state.errors.form}</span>
          </div>
        )}

        {/* Responsive Grid matching Campaigns Studio Layout */}
        <div className="post-composer-grid">
          {/* LEFT COLUMN: Main Post Copy & Creative Direction */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Card 1: Post Content */}
            <div className="campaign-brief-panel" style={{ gap: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  paddingBottom: 16,
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
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
                  <FileText size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    Post Content
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                    Write the copy and call-to-action you want to publish or save as a draft.
                  </p>
                </div>
              </div>

              {/* Title Field */}
              <div>
                <div className="campaign-field-label">
                  <span>
                    Post Title <span style={{ color: "#f87171" }}>*</span>
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "none", fontWeight: 400 }}>
                    Max 200 characters
                  </span>
                </div>
                <input
                  name="title"
                  defaultValue={post?.title || ""}
                  maxLength={200}
                  required
                  placeholder="e.g. 5 ways to improve your content strategy"
                  className="campaign-input"
                />
                {state.errors.title && (
                  <p style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: "#f87171" }}>
                    {state.errors.title}
                  </p>
                )}
              </div>

              {/* Caption / Body Field */}
              <div>
                <div className="campaign-field-label">
                  <span>Caption / Body</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "none", fontWeight: 400 }}>
                    Markdown &amp; emojis supported
                  </span>
                </div>
                <textarea
                  name="caption"
                  defaultValue={post?.caption || ""}
                  rows={8}
                  maxLength={10000}
                  placeholder="Write your post caption or long-form copy here..."
                  className="campaign-input"
                  style={{ resize: "vertical", minHeight: 180, lineHeight: 1.6 }}
                />
              </div>

              {/* 2-Column Row: CTA & Hashtags */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                <div>
                  <div className="campaign-field-label">
                    <span>Call to Action (CTA)</span>
                  </div>
                  <input
                    name="cta"
                    defaultValue={post?.cta || ""}
                    maxLength={500}
                    placeholder="e.g. Save this post for later"
                    className="campaign-input"
                  />
                </div>

                <div>
                  <div className="campaign-field-label">
                    <span>Hashtags</span>
                  </div>
                  <input
                    name="hashtags"
                    defaultValue={post?.hashtags || ""}
                    maxLength={2000}
                    placeholder="#contentmarketing #growth #ai"
                    className="campaign-input"
                  />
                  {state.errors.hashtags && (
                    <p style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: "#f87171" }}>
                      {state.errors.hashtags}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Media & Creative Direction */}
            <div className="campaign-brief-panel" style={{ gap: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  paddingBottom: 16,
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
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
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    Media &amp; Creative Direction
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                    Attach media assets or write visual directions for image generation.
                  </p>
                </div>
              </div>

              {/* Media Asset URL & Picker */}
              <div>
                <div className="campaign-field-label">
                  <span>Media Asset</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "none", fontWeight: 400 }}>
                    URL or select from library
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
                  <input
                    name="image_url"
                    value={imageUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setImageUrl(e.target.value);
                      setPreview(e.target.value);
                    }}
                    placeholder="Image URL or pick from library..."
                    className="campaign-input"
                  />
                  <select
                    aria-label="Select media from library"
                    defaultValue=""
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      const selected = media.find((item) => item.id === e.target.value);
                      if (selected) {
                        setImageUrl(selected.url);
                        setPreview(selected.url);
                      }
                    }}
                    className="campaign-input"
                    style={{ width: 190, height: 40 }}
                  >
                    <option value="">Select from library...</option>
                    {media.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.file_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Media Image Preview */}
              {preview && (
                <div
                  style={{
                    borderRadius: "var(--r-lg)",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "var(--bg-elevated)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  <img
                    src={preview}
                    alt="Post media preview"
                    style={{ maxHeight: 320, width: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              {/* AI Image Prompt Field */}
              <div>
                <div className="campaign-field-label">
                  <span>AI Image Prompt / Direction</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "none", fontWeight: 400 }}>
                    Visual direction description
                  </span>
                </div>
                <textarea
                  name="image_prompt"
                  defaultValue={post?.image_prompt || ""}
                  rows={4}
                  maxLength={2000}
                  placeholder="Describe the visual direction for an AI-generated image (e.g. Minimalist tech workspace with purple neon rim light)..."
                  className="campaign-input"
                  style={{ resize: "vertical", minHeight: 96, lineHeight: 1.6 }}
                />
              </div>

              {/* Media Library Link */}
              <div style={{ paddingTop: 4 }}>
                <Link
                  href="/media-library"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--accent)",
                    transition: "opacity 0.15s ease",
                  }}
                  className="hover:underline"
                >
                  <ImagePlus size={15} /> Open Media Library to upload new files &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Publishing Configuration & Card Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Card 1: Publishing Details */}
            <div className="campaign-brief-panel" style={{ gap: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  paddingBottom: 16,
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
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
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    Publishing Details
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                    Configure target channel &amp; schedule timing.
                  </p>
                </div>
              </div>

              {/* Platform Selector */}
              <div>
                <div className="campaign-field-label">
                  <span>Platform</span>
                </div>
                <select
                  name="platform"
                  defaultValue={post?.platform || "INSTAGRAM"}
                  className="campaign-input"
                  style={{ height: 42 }}
                >
                  {Object.entries(platformLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {state.errors.platform && (
                  <p style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: "#f87171" }}>
                    {state.errors.platform}
                  </p>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <div className="campaign-field-label">
                  <span>Status</span>
                </div>
                <select
                  name="status"
                  defaultValue={post?.status || initialStatus || "DRAFT"}
                  className="campaign-input"
                  style={{ height: 42 }}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="FAILED">Failed</option>
                </select>
                {state.errors.status && (
                  <p style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: "#f87171" }}>
                    {state.errors.status}
                  </p>
                )}
              </div>

              {/* Category Selector */}
              <div>
                <div className="campaign-field-label">
                  <span>Category</span>
                </div>
                <select
                  name="category_id"
                  defaultValue={post?.category_id || ""}
                  className="campaign-input"
                  style={{ height: 42 }}
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scheduled Date & Time */}
              <div>
                <div className="campaign-field-label">
                  <span>Scheduled Date &amp; Time</span>
                </div>
                <div style={{ position: "relative" }}>
                  <CalendarDays
                    size={16}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: 13,
                      color: "var(--text-muted)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="datetime-local"
                    name="scheduled_at"
                    defaultValue={toDateTimeLocal(post?.scheduled_at || initialScheduledAt || null)}
                    className="campaign-input"
                    style={{ paddingLeft: 40, height: 42 }}
                  />
                </div>
                {state.errors.scheduled_at && (
                  <p style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: "#f87171" }}>
                    {state.errors.scheduled_at}
                  </p>
                )}
              </div>
            </div>

            {/* Card 2: Card Preview */}
            {preview ? (
              <div className="campaign-brief-panel" style={{ padding: 20, gap: 14 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  <ImagePlus size={15} style={{ color: "var(--accent)" }} />
                  <span>Card Preview</span>
                </div>
                <div
                  style={{
                    borderRadius: "var(--r-lg)",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "var(--bg-elevated)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  <img
                    src={preview}
                    alt="Selected post media"
                    style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  borderRadius: "var(--r-xl)",
                  border: "1px dashed var(--border)",
                  background: "rgba(22, 22, 42, 0.4)",
                  padding: "32px 20px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--r-md)",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <ImagePlus size={20} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", margin: 0 }}>
                  No image attached
                </p>
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>
                  Select a file from media library or paste an image URL.
                </p>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Sticky Bottom Action Bar matching Campaigns Studio */}
      <div
        style={{
          position: "sticky",
          bottom: 24,
          zIndex: 20,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: "16px 20px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link
          href="/posts"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 16px",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
            fontSize: 12,
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
          className="hover:text-white hover:border-white/20"
        >
          <ArrowLeft size={15} /> Back to Posts
        </Link>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          {post && (
            <>
              <form action={duplicatePost}>
                <input type="hidden" name="post_id" value={post.id} />
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    height: 40,
                    padding: "0 16px",
                    borderRadius: "var(--r-md)",
                    border: "1px solid var(--border)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                    fontSize: 12,
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                  }}
                  className="hover:text-white hover:border-white/20"
                >
                  <Copy size={14} /> Duplicate
                </button>
              </form>
              <form
                action={deletePost}
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  if (!window.confirm("Delete this post? This action cannot be undone.")) event.preventDefault();
                }}
              >
                <input type="hidden" name="post_id" value={post.id} />
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    height: 40,
                    padding: "0 16px",
                    borderRadius: "var(--r-md)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    background: "rgba(239,68,68,0.1)",
                    color: "#f87171",
                    fontSize: 12,
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                  }}
                  className="hover:bg-red-500/20 hover:border-red-500/40"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </form>
            </>
          )}
          <button
            type="submit"
            form="post-editor-form"
            disabled={pending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 22px",
              borderRadius: "var(--r-md)",
              background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
              border: "none",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 4px 20px rgba(109,92,255,0.35)",
              transition: "all 0.15s ease",
              cursor: pending ? "not-allowed" : "pointer",
              opacity: pending ? 0.6 : 1,
            }}
            className="hover:brightness-110 active:scale-95"
          >
            <Save size={15} />
            {pending ? "Saving..." : post ? "Save Changes" : "Save Draft"}
          </button>
        </div>
      </div>
    </>
  );
}
