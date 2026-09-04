"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarPlus, ChevronLeft, ChevronRight, ExternalLink, Filter, RefreshCw, Send, X } from "lucide-react";
import type { Category, Platform, Post, PostStatus } from "@/types/database";
import { PlatformBadge } from "@/components/posts/platform-badge";
import { PostStatusBadge } from "@/components/posts/post-status";
import { reschedulePost, simulatePublishPost } from "@/lib/scheduling/actions";

interface CalendarPost extends Post {
  categories?: { name: string; color: string } | null;
}

type ViewMode = "month" | "week";

const platformOptions: { value: Platform | "ALL"; label: string }[] = [
  { value: "ALL", label: "All platforms" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "X", label: "X" },
];

const statusOptions: { value: PostStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PUBLISHED", label: "Published" },
  { value: "FAILED", label: "Failed" },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function weekLabel(date: Date) {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}–${end.getDate()}, ${end.getFullYear()}`;
  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function startOfWeek(date: Date) {
  const result = startOfDay(date);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function toDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function createAtNine(date: Date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0, 0);
  if (result.getTime() <= Date.now()) result.setHours(new Date().getHours() + 1, 0, 0, 0);
  return result;
}

export function ContentCalendar({ posts, categories }: { posts: CalendarPost[]; categories: Category[] }) {
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [platform, setPlatform] = useState<Platform | "ALL">("ALL");
  const [status, setStatus] = useState<PostStatus | "ALL">("ALL");
  const [category, setCategory] = useState("ALL");
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [toast, setToast] = useState("");

  const filteredPosts = useMemo(() => posts.filter((post) => {
    if (!post.scheduled_at) return false;
    if (platform !== "ALL" && post.platform !== platform) return false;
    if (status !== "ALL" && post.status !== status) return false;
    if (category !== "ALL" && post.category_id !== category) return false;
    return true;
  }), [posts, platform, status, category]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    for (const post of filteredPosts) {
      if (!post.scheduled_at) continue;
      const key = dateKey(new Date(post.scheduled_at));
      const list = map.get(key) ?? [];
      list.push(post);
      map.set(key, list);
    }
    for (const list of map.values()) list.sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());
    return map;
  }, [filteredPosts]);

  const monthDays = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [cursor]);

  function navigate(direction: number) {
    setCursor((current) => view === "month" ? addMonths(current, direction) : addDays(current, direction * 7));
  }

  function goToday() {
    setCursor(startOfDay(new Date()));
  }

  async function handlePublish(post: CalendarPost) {
    const formData = new FormData();
    formData.set("post_id", post.id);
    const result = await simulatePublishPost(formData);
    setToast(result.ok ? result.message || "Published." : result.error || "Could not publish the post.");
    if (result.ok) window.location.reload();
  }

  return <div className="space-y-5">
    {toast && <div role="status" className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><span>{toast}</span><button onClick={() => setToast("")} aria-label="Dismiss notification"><X size={16} /></button></div>}
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={goToday} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Today</button>
          <div className="flex items-center rounded-lg border border-slate-200">
            <button onClick={() => navigate(-1)} aria-label="Previous" className="p-2.5 text-slate-600 hover:bg-slate-50"><ChevronLeft size={17} /></button>
            <button onClick={() => navigate(1)} aria-label="Next" className="border-l border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"><ChevronRight size={17} /></button>
          </div>
          <h2 className="ml-1 text-lg font-bold text-slate-950">{view === "month" ? monthLabel(cursor) : weekLabel(cursor)}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"><Filter size={15} className="text-slate-400" /><span className="sr-only">Platform</span><select value={platform} onChange={(e) => setPlatform(e.target.value as Platform | "ALL")} className="bg-transparent text-sm font-medium text-slate-700 outline-none">{platformOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <select value={status} onChange={(e) => setStatus(e.target.value as PostStatus | "ALL")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"><option value="ALL">All statuses</option>{statusOptions.slice(1).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="max-w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none"><option value="ALL">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <div className="flex rounded-lg border border-slate-200 p-1"><button onClick={() => setView("month")} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${view === "month" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"}`}>Month</button><button onClick={() => setView("week")} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${view === "week" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50"}`}>Week</button></div>
        </div>
      </div>
    </section>
    {view === "month" ? <MonthView days={monthDays} cursor={cursor} postsByDay={postsByDay} onSelect={setSelectedPost} /> : <WeekView days={weekDays} postsByDay={postsByDay} onSelect={setSelectedPost} />}
    <div className="flex items-center justify-between text-xs text-slate-500"><span>{filteredPosts.length} scheduled item{filteredPosts.length === 1 ? "" : "s"} in the current filters.</span><Link href="/posts/new" className="font-semibold text-blue-600 hover:text-blue-700">Create from Posts</Link></div>
    {selectedPost && <PostDetailsModal post={selectedPost} onClose={() => setSelectedPost(null)} onPublish={handlePublish} />}
  </div>;
}

function MonthView({ days, cursor, postsByDay, onSelect }: { days: Date[]; cursor: Date; postsByDay: Map<string, CalendarPost[]>; onSelect: (post: CalendarPost) => void }) {
  const weekdays = Array.from({ length: 7 }, (_, index) => new Date(2024, 0, 7 + index).toLocaleDateString(undefined, { weekday: "short" }));
  return <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="min-w-[900px] grid grid-cols-7 border-b border-slate-200 bg-slate-50">{weekdays.map((day) => <div key={day} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">{day}</div>)}</div>
    <div className="min-w-[900px] grid grid-cols-7">
      {days.map((day) => <CalendarDay key={dateKey(day)} day={day} inMonth={day.getMonth() === cursor.getMonth()} posts={postsByDay.get(dateKey(day)) ?? []} onSelect={onSelect} />)}
    </div>
  </div>;
}

function CalendarDay({ day, inMonth, posts, onSelect }: { day: Date; inMonth: boolean; posts: CalendarPost[]; onSelect: (post: CalendarPost) => void }) {
  const today = dateKey(day) === dateKey(new Date());
  return <div className={`min-h-32 border-b border-r border-slate-100 p-2 sm:min-h-36 ${inMonth ? "bg-white" : "bg-slate-50/70"}`}>
    <div className="flex items-center justify-between gap-2"><Link href={`/posts/new?scheduled=${encodeURIComponent(createAtNine(day).toISOString())}&status=SCHEDULED`} aria-label={`Create post on ${day.toLocaleDateString()}`} className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold hover:ring-2 hover:ring-blue-100 ${today ? "bg-blue-600 text-white" : inMonth ? "text-slate-700" : "text-slate-400"}`}>{day.getDate()}</Link><Link href={`/posts/new?scheduled=${encodeURIComponent(createAtNine(day).toISOString())}&status=SCHEDULED`} aria-label={`Create post on ${day.toLocaleDateString()}`} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"><CalendarPlus size={15} /></Link></div>
    <div className="mt-2 space-y-1.5">{posts.slice(0, 3).map((post) => <button key={post.id} onClick={() => onSelect(post)} className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:border-blue-200 hover:bg-blue-50"><div className="flex items-center gap-1.5"><PlatformDot platform={post.platform} /><span className="truncate text-[11px] font-semibold text-slate-800">{post.title}</span></div><div className="mt-1 flex items-center justify-between gap-1"><span className="truncate text-[10px] text-slate-500">{post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}</span><StatusDot status={post.status} /></div></button>)}{posts.length > 3 && <span className="block px-1 text-[10px] font-semibold text-slate-500">+{posts.length - 3} more</span>}</div>
  </div>;
}

function WeekView({ days, postsByDay, onSelect }: { days: Date[]; postsByDay: Map<string, CalendarPost[]>; onSelect: (post: CalendarPost) => void }) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><div className="grid min-w-[980px] grid-cols-7">{days.map((day) => <div key={dateKey(day)} className="border-r border-slate-100 last:border-r-0"><div className={`border-b border-slate-200 px-3 py-3 ${dateKey(day) === dateKey(new Date()) ? "bg-blue-50" : "bg-slate-50"}`}><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{day.toLocaleDateString(undefined, { weekday: "short" })}</div><div className={`mt-1 text-lg font-bold ${dateKey(day) === dateKey(new Date()) ? "text-blue-700" : "text-slate-900"}`}>{day.getDate()}</div></div><div className="min-h-[520px] space-y-2 p-2">{(postsByDay.get(dateKey(day)) ?? []).map((post) => <button key={post.id} onClick={() => onSelect(post)} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-blue-200 hover:bg-blue-50"><div className="flex items-center justify-between gap-2"><PlatformDot platform={post.platform} /><span className="text-[11px] font-medium text-slate-500">{post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}</span></div><p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{post.title}</p><div className="mt-2"><PostStatusBadge status={post.status} /></div></button>)}{(postsByDay.get(dateKey(day)) ?? []).length === 0 && <Link href={`/posts/new?scheduled=${encodeURIComponent(createAtNine(day).toISOString())}&status=SCHEDULED`} className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs font-medium text-slate-400 hover:border-blue-300 hover:text-blue-600">Create post</Link>}</div></div>)}</div></div>;
}

function PlatformDot({ platform }: { platform: Platform }) {
  const label = platform === "INSTAGRAM" ? "IG" : platform === "FACEBOOK" ? "FB" : platform === "LINKEDIN" ? "IN" : "X";
  return <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-slate-200 px-1 text-[9px] font-bold text-slate-600">{label}</span>;
}

function StatusDot({ status }: { status: PostStatus }) {
  const className = status === "PUBLISHED" ? "bg-emerald-500" : status === "FAILED" ? "bg-red-500" : status === "SCHEDULED" ? "bg-amber-500" : "bg-slate-400";
  return <span className={`h-1.5 w-1.5 rounded-full ${className}`} aria-label={status.toLowerCase()} />;
}

function PostDetailsModal({ post, onClose, onPublish }: { post: CalendarPost; onClose: () => void; onPublish: (post: CalendarPost) => void }) {
  const [schedule, setSchedule] = useState(() => post.scheduled_at ? toDateTimeLocal(new Date(post.scheduled_at)) : "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [minDateTime] = useState(() => toDateTimeLocal(new Date(Date.now() + 60000)));

  async function handleReschedule() {
    setPending(true);
    setError("");
    const formData = new FormData();
    formData.set("post_id", post.id);
    const parsed = new Date(schedule);
    formData.set("scheduled_at", Number.isNaN(parsed.getTime()) ? schedule : parsed.toISOString());
    const result = await reschedulePost(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.error || "Could not reschedule the post.");
      return;
    }
    window.location.reload();
  }

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="calendar-post-title">
    <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
      <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><PlatformBadge platform={post.platform} /><PostStatusBadge status={post.status} /></div><h2 id="calendar-post-title" className="mt-3 text-lg font-bold text-slate-950">{post.title}</h2></div><button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div>
      {post.image_url && <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><img src={post.image_url} alt="" className="max-h-56 w-full object-cover" /></div>}
      <p className="mt-4 line-clamp-5 text-sm leading-6 text-slate-600">{post.caption || "No caption added yet."}</p>
      <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</p><p className="mt-1 text-sm font-medium text-slate-700">{post.categories?.name || "Uncategorized"}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scheduled</p><p className="mt-1 text-sm font-medium text-slate-700">{post.scheduled_at ? formatDateTime(post.scheduled_at) : "Not scheduled"}</p></div></div>
      {post.status === "SCHEDULED" && <div className="mt-5 rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><RefreshCw size={15} /> Reschedule</div><p className="mt-1 text-xs text-slate-500">Choose a future date and time. The change is saved immediately.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input type="datetime-local" value={schedule} min={minDateTime} onChange={(e) => setSchedule(e.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /><button disabled={pending} onClick={handleReschedule} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving..." : "Save time"}</button></div>{error && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{error}</p>}</div>}
      <div className="mt-5 flex flex-wrap justify-end gap-2"><Link href={`/posts/${post.id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ExternalLink size={15} /> Edit post</Link>{post.status === "SCHEDULED" && <button onClick={() => onPublish(post)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Send size={15} /> Simulate publish</button>}</div>
    </div>
  </div>;
}
