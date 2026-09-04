"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { CheckCircle2, Clock3, ExternalLink, RefreshCw, Send, TriangleAlert } from "lucide-react";
import { simulatePublish, retryPublish } from "@/lib/publishing/actions";
import { publishRealPost } from "@/lib/social/actions";
import { PlatformBadge } from "@/components/posts/platform-badge";
import { PostStatusBadge } from "@/components/posts/post-status";
import type { Platform, PostStatus } from "@/types/database";
import type { SocialAccount } from "@/lib/social/types";

type Event = { id: string; post_id: string; platform: Platform; action: string; status: "SUCCESS" | "FAILED"; external_post_id: string | null; message: string | null; error_code: string | null; attempted_at: string };
type Post = { id: string; title: string; caption: string | null; platform: Platform; status: PostStatus; scheduled_at: string | null; published_at: string | null; image_url: string | null };

function formatDate(value: string | null) { return value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—"; }

export function PublishingDashboard({ posts, events, accounts }: { posts: Post[]; events: Event[]; accounts: SocialAccount[] }) {
  const latestByPost = new Map<string, Event>();
  for (const event of events) if (!latestByPost.has(event.post_id)) latestByPost.set(event.post_id, event);

  async function run(action: typeof simulatePublish | typeof retryPublish, postId: string, mode?: "SUCCESS" | "FAILURE") {
    const fd = new FormData(); fd.set("post_id", postId); if (mode) fd.set("simulation_mode", mode);
    const result = await action(fd); window.location.reload(); return result;
  }

  async function realPublish(postId: string, accountId: string) {
    const result = await publishRealPost({ postId, accountId });
    if (!result.ok) window.alert(result.error || "Publishing failed.");
    else window.alert(result.message || "Published successfully.");
    window.location.reload();
  }

  return <div className="space-y-6">
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800"><strong>Demo + real publishing.</strong> Demo buttons never call social APIs. Real publishing is available only for connected workspace accounts.</div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-950">Publishing queue</h2><p className="mt-1 text-xs text-slate-500">Use Failure mode to test errors, then Retry to simulate a successful recovery.</p></div>
      {posts.length === 0 ? <div className="px-5 py-14 text-center"><Send className="mx-auto text-slate-400" size={24} /><p className="mt-3 font-semibold text-slate-900">No publishable posts</p><p className="mt-1 text-sm text-slate-500">Create and schedule a post first.</p><Link href="/posts/new" className="mt-4 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Create Post</Link></div> : <div className="divide-y divide-slate-100">{posts.map((post) => { const event = latestByPost.get(post.id); return <div key={post.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.4fr)_150px_180px_minmax(280px,1fr)] lg:items-center"><div className="flex min-w-0 items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">{post.image_url ? <img src={post.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400"><Send size={17} /></div>}</div><div className="min-w-0"><Link href={`/posts/${post.id}/edit`} className="truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{post.title}</Link><p className="mt-1 line-clamp-2 text-xs text-slate-500">{post.caption || "No caption"}</p></div></div><div><PlatformBadge platform={post.platform} /><div className="mt-2"><PostStatusBadge status={post.status} /></div></div><div className="text-xs text-slate-500"><p><span className="font-semibold text-slate-700">Scheduled:</span> {formatDate(post.scheduled_at)}</p><p className="mt-1"><span className="font-semibold text-slate-700">Published:</span> {formatDate(post.published_at)}</p></div><div className="space-y-3"><div className={`rounded-lg border px-3 py-2 text-xs ${event?.status === "FAILED" ? "border-red-200 bg-red-50 text-red-700" : event?.status === "SUCCESS" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>{event ? <div className="flex gap-2">{event.status === "FAILED" ? <TriangleAlert size={15} /> : <CheckCircle2 size={15} />}<div><p className="font-semibold">{event.status === "FAILED" ? "Publishing error" : "Published successfully"}</p><p className="mt-0.5">{event.message || "No message"}</p><p className="mt-0.5 opacity-75">{formatDate(event.attempted_at)}</p></div></div> : <div className="flex gap-2"><Clock3 size={15} /><span>No publishing attempt yet.</span></div>}</div><div className="flex flex-wrap gap-2">{accounts.filter((account) => account.platform === post.platform).map((account) => <button key={account.id} onClick={() => void realPublish(post.id, account.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Publish to {account.platform === "X" ? "X" : account.platform.charAt(0) + account.platform.slice(1).toLowerCase()}</button>)}{post.status === "SCHEDULED" && <><button onClick={() => run(simulatePublish, post.id, "SUCCESS")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"><Send size={14} /> Simulate success</button><button onClick={() => run(simulatePublish, post.id, "FAILURE")} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><TriangleAlert size={14} /> Simulate failure</button></>}{post.status === "FAILED" && <button onClick={() => run(retryPublish, post.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"><RefreshCw size={14} /> Retry</button>}<Link href={`/posts/${post.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ExternalLink size={14} /> Edit</Link></div></div></div> })}</div>}
    </section>
  </div>;
}
