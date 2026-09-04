"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useTransition } from "react";
import { CheckCircle2, ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { deleteMedia, uploadMedia } from "@/lib/content/media-actions";
import type { Media } from "@/types/database";

export function MediaLibrary({ media }: { media: Media[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return <div className="space-y-6">
    <form action={async (formData: FormData) => { setMessage(""); setError(""); startTransition(async () => { const result = await uploadMedia(formData); if (!result.ok) setError(result.error || "Upload failed."); else setMessage(result.storageBacked ? "Image uploaded successfully." : "Image saved in demo fallback mode because Supabase Storage is unavailable."); }); }} className="rounded-xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><UploadCloud size={20} /></div><div><h2 className="text-sm font-semibold text-slate-900">Upload an image</h2><p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP or GIF up to 5 MB.</p></div></div><div className="flex w-full gap-2 sm:w-auto"><input required name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="block min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1.5 file:text-xs file:font-semibold sm:w-72" /><button disabled={isPending} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"><ImagePlus size={16} />{isPending ? "Uploading..." : "Upload"}</button></div></div>
    </form>
    {message && <div role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 size={16} />{message}</div>}
    {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
    {media.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><ImagePlus size={21} className="text-slate-400" /></div><h2 className="mt-4 text-base font-semibold text-slate-900">Your media library is empty</h2><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Upload your first image above. It will be available to attach to any post in this workspace.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{media.map((item) => <div key={item.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="aspect-square bg-slate-100">{item.url ? <img src={item.url} alt={item.file_name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><ImagePlus /></div>}</div><div className="p-3"><div className="truncate text-sm font-semibold text-slate-800" title={item.file_name}>{item.file_name}</div><div className="mt-1 flex items-center justify-between gap-2"><span className="text-xs text-slate-500">{formatBytes(item.file_size)}</span><span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.source === "DEMO_FALLBACK" ? "Demo" : item.source === "AI_GENERATED" ? "AI Generated" : "Stored"}</span></div><form action={async (formData: FormData) => { if (!window.confirm(`Delete ${item.file_name}?`)) return; startTransition(async () => { const result = await deleteMedia(formData); if (!result.ok) setError(result.error || "Could not delete media."); else setMessage("Media deleted."); }); }} className="mt-3"><input type="hidden" name="media_id" value={item.id} /><button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /> Delete</button></form></div></div>)}</div>}
  </div>;
}

function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
