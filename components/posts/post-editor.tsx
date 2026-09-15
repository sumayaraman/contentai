"use client";
/* eslint-disable @next/next/no-img-element */

import { useActionState, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { ImagePlus, Save, Trash2, Copy, ArrowLeft, CalendarDays } from "lucide-react";
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

const inputBaseClass =
  "w-full rounded-xl border border-white/10 bg-[#121222] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";
const selectBaseClass =
  "h-10 w-full rounded-xl border border-white/10 bg-[#121222] px-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

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
      <form id="post-editor-form" action={formAction} className="space-y-8 pb-32">
        {post && <input type="hidden" name="post_id" value={post.id} />}
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Content Column */}
          <div className="space-y-8">
            <section className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
              <div className="mb-6 border-b border-white/[0.06] pb-4">
                <h2 className="text-lg font-semibold tracking-tight text-white">Post Content</h2>
                <p className="mt-1 text-xs text-white/50">Write the copy and call-to-action you want to publish or save as a draft.</p>
              </div>
              <div className="space-y-6">
                <Field label="Post Title" error={state.errors.title}>
                  <input
                    name="title"
                    defaultValue={post?.title || ""}
                    maxLength={200}
                    required
                    placeholder="e.g. 5 ways to improve your content strategy"
                    className={inputBaseClass}
                  />
                </Field>
                <Field label="Caption / Body">
                  <textarea
                    name="caption"
                    defaultValue={post?.caption || ""}
                    rows={9}
                    maxLength={10000}
                    placeholder="Write your post caption or long-form copy here..."
                    className={`${inputBaseClass} resize-y leading-relaxed`}
                  />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Call to Action (CTA)">
                    <input
                      name="cta"
                      defaultValue={post?.cta || ""}
                      maxLength={500}
                      placeholder="e.g. Save this post for later"
                      className={inputBaseClass}
                    />
                  </Field>
                  <Field label="Hashtags" error={state.errors.hashtags}>
                    <input
                      name="hashtags"
                      defaultValue={post?.hashtags || ""}
                      maxLength={2000}
                      placeholder="#contentmarketing #growth #ai"
                      className={inputBaseClass}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
              <div className="mb-6 border-b border-white/[0.06] pb-4">
                <h2 className="text-lg font-semibold tracking-tight text-white">Media & Creative Direction</h2>
                <p className="mt-1 text-xs text-white/50">Attach media assets or write visual directions for image generation.</p>
              </div>
              <div className="space-y-6">
                <Field label="Media Asset">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      name="image_url"
                      value={imageUrl}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setImageUrl(e.target.value);
                        setPreview(e.target.value);
                      }}
                      placeholder="Image URL or pick from library"
                      className={inputBaseClass}
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
                      className={`${selectBaseClass} sm:w-48`}
                    >
                      <option value="">Select from library...</option>
                      {media.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.file_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>

                {preview && (
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121222]/60">
                    <img src={preview} alt="Post media preview" className="max-h-80 w-full object-cover" />
                  </div>
                )}

                <Field label="AI Image Prompt / Direction">
                  <textarea
                    name="image_prompt"
                    defaultValue={post?.image_prompt || ""}
                    rows={4}
                    maxLength={2000}
                    placeholder="Describe the visual direction for an AI-generated image (e.g. Minimalist tech workspace with purple neon rim light)..."
                    className={`${inputBaseClass} resize-y leading-relaxed`}
                  />
                </Field>

                <div className="pt-2">
                  <Link
                    href="/media-library"
                    className="inline-flex items-center gap-2 text-xs font-medium text-violet-400 hover:text-violet-300 transition"
                  >
                    <ImagePlus size={15} /> Open Media Library to upload new files &rarr;
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-8">
            <section className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-6 backdrop-blur-xl shadow-lg shadow-black/20">
              <h2 className="text-lg font-semibold tracking-tight text-white mb-1">Publishing Details</h2>
              <p className="text-xs text-white/50 mb-6 border-b border-white/[0.06] pb-4">Configure target channel and schedule timing.</p>
              <div className="space-y-5">
                <Field label="Platform" error={state.errors.platform}>
                  <select name="platform" defaultValue={post?.platform || "INSTAGRAM"} className={selectBaseClass}>
                    {Object.entries(platformLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status" error={state.errors.status}>
                  <select
                    name="status"
                    defaultValue={post?.status || initialStatus || "DRAFT"}
                    className={selectBaseClass}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </Field>
                <Field label="Category">
                  <select name="category_id" defaultValue={post?.category_id || ""} className={selectBaseClass}>
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Scheduled Date & Time" error={state.errors.scheduled_at}>
                  <div className="relative">
                    <CalendarDays size={16} className="pointer-events-none absolute left-3.5 top-3 text-white/40" />
                    <input
                      type="datetime-local"
                      name="scheduled_at"
                      defaultValue={toDateTimeLocal(post?.scheduled_at || initialScheduledAt || null)}
                      className={`${inputBaseClass} pl-10`}
                    />
                  </div>
                </Field>
              </div>
              {state.errors.form && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
                  {state.errors.form}
                </div>
              )}
            </section>

            {preview ? (
              <section className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-5 backdrop-blur-xl shadow-lg shadow-black/20">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/70">
                  <ImagePlus size={15} /> Card Preview
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121222]/50">
                  <img src={preview} alt="Selected post media" className="aspect-square w-full object-cover" />
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-dashed border-white/10 bg-[#0e0e1a]/40 p-6 text-center">
                <ImagePlus className="mx-auto text-white/30" size={24} />
                <p className="mt-3 text-xs font-medium text-white/60">No image attached</p>
                <p className="mt-1 text-[11px] text-white/40">Select a file from media library or paste a URL.</p>
              </section>
            )}
          </aside>
        </div>
      </form>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-6 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0e0e1a]/95 p-4 shadow-2xl backdrop-blur-xl">
        <Link
          href="/posts"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
        >
          <ArrowLeft size={15} /> Back to posts
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          {post && (
            <>
              <form action={duplicatePost}>
                <input type="hidden" name="post_id" value={post.id} />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
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
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
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
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 transition disabled:opacity-50"
          >
            <Save size={14} />
            {pending ? "Saving..." : post ? "Save Changes" : "Save Draft"}
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children?: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-red-400">{error}</p>}
    </div>
  );
}
