"use client";

import { Copy, Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { deletePost, duplicatePost } from "@/lib/content/actions";

export function PostActions({ postId }: { postId: string }) {
  function confirmDelete(event: import("react").FormEvent<HTMLFormElement>) {
    if (!window.confirm("Delete this post? This action cannot be undone.")) event.preventDefault();
  }

  return <div className="flex items-center justify-end gap-1">
    <Link aria-label="Edit post" href={`/posts/${postId}/edit`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Edit3 size={16} /></Link>
    <form action={duplicatePost}><input type="hidden" name="post_id" value={postId} /><button aria-label="Duplicate post" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Copy size={16} /></button></form>
    <form action={deletePost} onSubmit={confirmDelete}><input type="hidden" name="post_id" value={postId} /><button aria-label="Delete post" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></form>
    <button aria-label="More actions" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><MoreHorizontal size={16} /></button>
  </div>;
}
