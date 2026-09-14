"use client";

import { Copy, Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { deletePost, duplicatePost } from "@/lib/content/actions";

export function PostActions({ postId }: { postId: string }) {
  function confirmDelete(event: import("react").FormEvent<HTMLFormElement>) {
    if (!window.confirm("Delete this post? This action cannot be undone.")) event.preventDefault();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        aria-label="Edit post"
        href={`/posts/${postId}/edit`}
        className="rounded-xl p-2 text-white/50 hover:bg-white/[0.06] hover:text-white transition"
      >
        <Edit3 size={15} />
      </Link>
      <form action={duplicatePost}>
        <input type="hidden" name="post_id" value={postId} />
        <button
          aria-label="Duplicate post"
          className="rounded-xl p-2 text-white/50 hover:bg-white/[0.06] hover:text-white transition"
        >
          <Copy size={15} />
        </button>
      </form>
      <form action={deletePost} onSubmit={confirmDelete}>
        <input type="hidden" name="post_id" value={postId} />
        <button
          aria-label="Delete post"
          className="rounded-xl p-2 text-white/50 hover:bg-rose-500/10 hover:text-rose-400 transition"
        >
          <Trash2 size={15} />
        </button>
      </form>
      <button
        aria-label="More actions"
        className="rounded-xl p-2 text-white/40 hover:bg-white/[0.06] hover:text-white transition"
      >
        <MoreHorizontal size={15} />
      </button>
    </div>
  );
}

