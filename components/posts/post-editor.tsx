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

export function PostEditor({ post, categories, media, initialScheduledAt, initialStatus }: { post: Post | null; categories: Category[]; media: Media[]; initialScheduledAt?: string | null; initialStatus?: PostStatus }) {
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

  return <>
  <form id="post-editor-form" action={formAction} className="space-y-8 pb-32">
    {post && <input type="hidden" name="post_id" value={post.id} />}
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-8">
        <section className="card" style={{ padding: 24 }}>
          <div className="mb-6"><h2 className="card-title">Post content</h2><p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Write the content you want to publish or keep as a draft.</p></div>
          <div className="space-y-6">
            <Field label="Title" error={state.errors.title}><input name="title" defaultValue={post?.title || ""} maxLength={200} required placeholder="e.g. 5 ways to improve your content strategy" className={inputClass} /></Field>
            <Field label="Caption"><textarea name="caption" defaultValue={post?.caption || ""} rows={9} maxLength={10000} placeholder="Write your caption..." className={`${inputClass} resize-y py-3`} /></Field>
            <Field label="CTA"><input name="cta" defaultValue={post?.cta || ""} maxLength={500} placeholder="e.g. Save this post for later" className={inputClass} /></Field>
            <Field label="Hashtags" error={state.errors.hashtags}><textarea name="hashtags" defaultValue={post?.hashtags || ""} rows={3} maxLength={2000} placeholder="#contentmarketing #socialmedia #growth" className={`${inputClass} resize-y py-3`} /></Field>
          </div>
        </section>

        <section className="card" style={{ padding: 24 }}>
          <div className="mb-6"><h2 className="card-title">Media & creative direction</h2><p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Attach existing media or leave an image prompt for a future AI workflow.</p></div>
          <div className="space-y-6">
            <Field label="Image">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input name="image_url" value={imageUrl} onChange={(e: ChangeEvent<HTMLInputElement>) => { setImageUrl(e.target.value); setPreview(e.target.value); }} placeholder="Image URL or select from Media Library" className={inputClass} />
                <select aria-label="Select media" defaultValue="" onChange={(e: ChangeEvent<HTMLSelectElement>) => { const selected = media.find((item) => item.id === e.target.value); if (selected) { setImageUrl(selected.url); setPreview(selected.url); } }} className={inputClass} style={{ width: "auto", minWidth: 160 }}>
                  <option value="">Choose media</option>
                  {media.map((item) => <option key={item.id} value={item.id}>{item.file_name}</option>)}
                </select>
              </div>
            </Field>
            {preview && <div style={{ overflow: "hidden", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", background: "var(--bg-elevated)" }}><img src={preview} alt="Post media preview" className="max-h-80 w-full object-cover" /></div>}
            <Field label="Image prompt"><textarea name="image_prompt" defaultValue={post?.image_prompt || ""} rows={4} maxLength={2000} placeholder="Describe the visual direction for a future generated image..." className={`${inputClass} resize-y py-3`} /></Field>
            <Link href="/media-library" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--accent)" }}><ImagePlus size={16} /> Manage media</Link>
          </div>
        </section>
      </div>

      <aside className="space-y-8">
        <section className="card" style={{ padding: 24 }}>
          <h2 className="card-title">Publishing details</h2>
          <div className="mt-6 space-y-6">
            <Field label="Platform" error={state.errors.platform}><select name="platform" defaultValue={post?.platform || "INSTAGRAM"} className={inputClass}>{Object.entries(platformLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Status" error={state.errors.status}><select name="status" defaultValue={post?.status || initialStatus || "DRAFT"} className={inputClass}><option value="DRAFT">Draft</option><option value="SCHEDULED">Scheduled</option><option value="PUBLISHED">Published</option><option value="FAILED">Failed</option></select></Field>
            <Field label="Category"><select name="category_id" defaultValue={post?.category_id || ""} className={inputClass}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            <Field label="Scheduled date" error={state.errors.scheduled_at}>
              <div style={{ position: "relative" }}>
                <CalendarDays size={16} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="datetime-local" name="scheduled_at" defaultValue={toDateTimeLocal(post?.scheduled_at || initialScheduledAt || null)} className={inputClass} style={{ paddingLeft: 36 }} />
              </div>
            </Field>
          </div>
          {state.errors.form && <p className="mt-5" style={{ borderRadius: "var(--r-md)", background: "var(--red-soft)", padding: "10px 12px", fontSize: 13, color: "var(--red)" }}>{state.errors.form}</p>}
        </section>

        {preview ? (
          <section className="card" style={{ padding: 24 }}>
            <div className="mb-4" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}><ImagePlus size={16} /> Preview</div>
            <div style={{ overflow: "hidden", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}><img src={preview} alt="Selected post media" className="aspect-square w-full object-cover" /></div>
          </section>
        ) : (
          <section className="card" style={{ padding: 24, textAlign: "center", borderStyle: "dashed" }}>
            <ImagePlus style={{ margin: "0 auto", color: "var(--text-muted)" }} size={22} />
            <p className="mt-3" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>No image attached</p>
            <p className="mt-2" style={{ fontSize: 12, color: "var(--text-muted)" }}>Upload an image in the Media Library when you're ready.</p>
          </section>
        )}
      </aside>
    </div>

    </form>
    <div className="sticky bottom-4 z-10" style={{
      display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12,
      borderRadius: "var(--r-lg)", border: "1px solid var(--border)", background: "rgba(15,15,26,0.97)",
      padding: 14, boxShadow: "var(--shadow-md)", backdropFilter: "blur(16px)",
    }}>
      <Link href="/posts" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back to posts</Link>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {post && <>
          <form action={duplicatePost}><input type="hidden" name="post_id" value={post.id} /><button className="btn btn-primary btn-sm"><Copy size={15} /> Duplicate</button></form>
          <form action={deletePost} onSubmit={(event: FormEvent<HTMLFormElement>) => { if (!window.confirm("Delete this post? This action cannot be undone.")) event.preventDefault(); }}>
            <input type="hidden" name="post_id" value={post.id} />
            <button className="btn btn-danger btn-sm"><Trash2 size={15} /> Delete</button>
          </form>
        </>}
        <button type="submit" form="post-editor-form" disabled={pending} className="btn btn-ai btn-sm"><Save size={15} />{pending ? "Saving..." : post ? "Save Changes" : "Save Draft"}</button>
      </div>
    </div>
  </>
}

const inputClass = "w-full outline-none";
function Field({ label, error, children }: { label: string; error?: string; children?: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</label>
      {children}
      {error && <p className="mt-2" style={{ fontSize: 12, fontWeight: 500, color: "var(--red)" }}>{error}</p>}
    </div>
  );
}
