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
  <form id="post-editor-form" action={formAction} className="space-y-6">
    {post && <input type="hidden" name="post_id" value={post.id} />}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5"><h2 className="font-semibold text-slate-950">Post content</h2><p className="mt-1 text-sm text-slate-500">Write the content you want to publish or keep as a draft.</p></div>
          <div className="space-y-5">
            <Field label="Title" error={state.errors.title}><input name="title" defaultValue={post?.title || ""} maxLength={200} required placeholder="e.g. 5 ways to improve your content strategy" className={inputClass} /></Field>
            <Field label="Caption"><textarea name="caption" defaultValue={post?.caption || ""} rows={9} maxLength={10000} placeholder="Write your caption..." className={`${inputClass} resize-y py-3`} /></Field>
            <Field label="CTA"><input name="cta" defaultValue={post?.cta || ""} maxLength={500} placeholder="e.g. Save this post for later" className={inputClass} /></Field>
            <Field label="Hashtags" error={state.errors.hashtags}><textarea name="hashtags" defaultValue={post?.hashtags || ""} rows={3} maxLength={2000} placeholder="#contentmarketing #socialmedia #growth" className={`${inputClass} resize-y py-3`} /></Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5"><h2 className="font-semibold text-slate-950">Media & creative direction</h2><p className="mt-1 text-sm text-slate-500">Attach existing media or leave an image prompt for a future AI workflow.</p></div>
          <div className="space-y-5">
            <Field label="Image"><div className="grid gap-3 sm:grid-cols-[1fr_auto]"><input name="image_url" value={imageUrl} onChange={(e: ChangeEvent<HTMLInputElement>) => { setImageUrl(e.target.value); setPreview(e.target.value); }} placeholder="Image URL or select from Media Library" className={inputClass} /><select aria-label="Select media" defaultValue="" onChange={(e: ChangeEvent<HTMLSelectElement>) => { const selected = media.find((item) => item.id === e.target.value); if (selected) { setImageUrl(selected.url); setPreview(selected.url); } }} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"><option value="">Choose media</option>{media.map((item) => <option key={item.id} value={item.id}>{item.file_name}</option>)}</select></div></Field>
            {preview && <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><img src={preview} alt="Post media preview" className="max-h-80 w-full object-cover" /></div>}
            <Field label="Image prompt"><textarea name="image_prompt" defaultValue={post?.image_prompt || ""} rows={4} maxLength={2000} placeholder="Describe the visual direction for a future generated image..." className={`${inputClass} resize-y py-3`} /></Field>
            <Link href="/media-library" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"><ImagePlus size={16} /> Manage media</Link>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Publishing details</h2>
          <div className="mt-5 space-y-5">
            <Field label="Platform" error={state.errors.platform}><select name="platform" defaultValue={post?.platform || "INSTAGRAM"} className={inputClass}>{Object.entries(platformLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Status" error={state.errors.status}><select name="status" defaultValue={post?.status || initialStatus || "DRAFT"} className={inputClass}><option value="DRAFT">Draft</option><option value="SCHEDULED">Scheduled</option><option value="PUBLISHED">Published</option><option value="FAILED">Failed</option></select></Field>
            <Field label="Category"><select name="category_id" defaultValue={post?.category_id || ""} className={inputClass}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            <Field label="Scheduled date" error={state.errors.scheduled_at}><div className="relative"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input type="datetime-local" name="scheduled_at" defaultValue={toDateTimeLocal(post?.scheduled_at || initialScheduledAt || null)} className={`${inputClass} pl-9`} /></div></Field>
          </div>
          {state.errors.form && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.errors.form}</p>}
        </section>

        {preview ? <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><ImagePlus size={16} /> Preview</div><div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"><img src={preview} alt="Selected post media" className="aspect-square w-full object-cover" /></div></section> : <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center"><ImagePlus className="mx-auto text-slate-400" size={22} /><p className="mt-2 text-sm font-medium text-slate-700">No image attached</p><p className="mt-1 text-xs text-slate-500">Upload an image in the Media Library when you’re ready.</p></section>}
      </aside>
    </div>

    </form>
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
      <Link href="/posts" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><ArrowLeft size={16} /> Back to posts</Link>
      <div className="flex flex-wrap items-center gap-2">
        {post && <><form action={duplicatePost}><input type="hidden" name="post_id" value={post.id} /><button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Copy size={15} /> Duplicate</button></form><form action={deletePost} onSubmit={(event: FormEvent<HTMLFormElement>) => { if (!window.confirm("Delete this post? This action cannot be undone.")) event.preventDefault(); }}><input type="hidden" name="post_id" value={post.id} /><button className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={15} /> Delete</button></form></>}
        <button type="submit" form="post-editor-form" disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"><Save size={15} />{pending ? "Saving..." : post ? "Save Changes" : "Save Draft"}</button>
      </div>
    </div>
  </>
}

const inputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
function Field({ label, error, children }: { label: string; error?: string; children?: React.ReactNode }) { return <div><label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>{children}{error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}</div>; }
