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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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

const selectClass =
  "h-9 rounded-xl border border-white/10 bg-[#121222] px-3 text-xs text-white outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20";

export function ContentCalendar({ posts, categories }: { posts: CalendarPost[]; categories: Category[] }) {
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [platform, setPlatform] = useState<Platform | "ALL">("ALL");
  const [status, setStatus] = useState<PostStatus | "ALL">("ALL");
  const [category, setCategory] = useState("ALL");
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [toast, setToast] = useState("");

  const filteredPosts = useMemo(
    () =>
      posts.filter((post) => {
        if (!post.scheduled_at) return false;
        if (platform !== "ALL" && post.platform !== platform) return false;
        if (status !== "ALL" && post.status !== status) return false;
        if (category !== "ALL" && post.category_id !== category) return false;
        return true;
      }),
    [posts, platform, status, category]
  );

  const postsByDay = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    for (const post of filteredPosts) {
      if (!post.scheduled_at) continue;
      const key = dateKey(new Date(post.scheduled_at));
      const list = map.get(key) ?? [];
      list.push(post);
      map.set(key, list);
    }
    for (const list of map.values())
      list.sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());
    return map;
  }, [filteredPosts]);

  const monthDays = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  function navigate(direction: number) {
    setCursor((c) => (view === "month" ? addMonths(c, direction) : addDays(c, direction * 7)));
  }

  async function handlePublish(post: CalendarPost) {
    const formData = new FormData();
    formData.set("post_id", post.id);
    const result = await simulatePublishPost(formData);
    setToast(result.ok ? result.message || "Published." : result.error || "Could not publish.");
    if (result.ok) window.location.reload();
  }

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-300">
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="text-emerald-400 hover:text-white transition">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-3.5 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCursor(startOfDay(new Date()))}
              className="inline-flex h-9 items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/90 hover:bg-white/[0.08] hover:text-white transition"
            >
              Today
            </button>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02]">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex h-9 w-9 items-center justify-center text-white/60 hover:text-white transition"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="h-4 w-px bg-white/10" />
              <button
                onClick={() => navigate(1)}
                className="inline-flex h-9 w-9 items-center justify-center text-white/60 hover:text-white transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 className="ml-1 text-sm font-semibold tracking-tight text-white sm:text-base">
              {view === "month" ? monthLabel(cursor) : weekLabel(cursor)}
            </h2>
          </div>

          {/* Right: Filters & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-white/10 bg-[#121222] px-2.5">
              <Filter size={13} className="text-white/40 mr-1.5" />
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform | "ALL")}
                className="h-9 bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                {platformOptions.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#121222] text-white">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PostStatus | "ALL")}
              className={selectClass}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#121222] text-white">
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              <option value="ALL" className="bg-[#121222] text-white">
                All categories
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#121222] text-white">
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex items-center rounded-xl border border-white/10 bg-[#121222] p-1 gap-1">
              {(["month", "week"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                    view === v
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {view === "month" ? (
        <MonthView days={monthDays} cursor={cursor} postsByDay={postsByDay} onSelect={setSelectedPost} />
      ) : (
        <WeekView days={weekDays} postsByDay={postsByDay} onSelect={setSelectedPost} />
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between px-1 text-xs text-white/50">
        <span>
          {filteredPosts.length} scheduled item{filteredPosts.length === 1 ? "" : "s"}
        </span>
        <Link href="/posts/new" className="font-semibold text-violet-400 hover:text-violet-300 transition">
          + Create Post
        </Link>
      </div>

      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}

function MonthView({
  days,
  cursor,
  postsByDay,
  onSelect,
}: {
  days: Date[];
  cursor: Date;
  postsByDay: Map<string, CalendarPost[]>;
  onSelect: (p: CalendarPost) => void;
}) {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="grid grid-cols-7 border-b border-white/[0.08] bg-white/[0.02]">
        {weekdays.map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-white/50"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <CalendarDay
            key={dateKey(day)}
            day={day}
            inMonth={day.getMonth() === cursor.getMonth()}
            posts={postsByDay.get(dateKey(day)) ?? []}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarDay({
  day,
  inMonth,
  posts,
  onSelect,
}: {
  day: Date;
  inMonth: boolean;
  posts: CalendarPost[];
  onSelect: (p: CalendarPost) => void;
}) {
  const today = dateKey(day) === dateKey(new Date());
  return (
    <div
      className={`min-h-[110px] border-b border-r border-white/[0.06] p-2 transition sm:min-h-[125px] ${
        inMonth ? "bg-[#0e0e1a]/40 hover:bg-white/[0.02]" : "bg-black/40 opacity-45"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <Link
          href={`/posts/new?scheduled=${encodeURIComponent(createAtNine(day).toISOString())}&status=SCHEDULED`}
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition ${
            today
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/40"
              : inMonth
              ? "text-white/80 hover:bg-white/10"
              : "text-white/30"
          }`}
        >
          {day.getDate()}
        </Link>
        <Link
          href={`/posts/new?scheduled=${encodeURIComponent(createAtNine(day).toISOString())}&status=SCHEDULED`}
          className="text-white/20 hover:text-white/60 transition"
          title="Schedule post on this day"
        >
          <CalendarPlus size={13} />
        </Link>
      </div>

      <div className="flex flex-col gap-1.5">
        {posts.slice(0, 3).map((post) => (
          <button
            key={post.id}
            onClick={() => onSelect(post)}
            className="group w-full rounded-lg border border-white/[0.08] bg-[#141424] p-1.5 text-left transition hover:border-violet-500/40 hover:bg-[#19192e]"
          >
            <div className="flex items-center gap-1.5">
              <PlatformDot platform={post.platform} />
              <span className="truncate text-[11px] font-semibold text-white/90 group-hover:text-violet-200">
                {post.title}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-white/40">
              <span>
                {post.scheduled_at
                  ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                  : ""}
              </span>
              <StatusDot status={post.status} />
            </div>
          </button>
        ))}
        {posts.length > 3 && (
          <span className="px-1 text-[10px] font-medium text-white/40">+{posts.length - 3} more</span>
        )}
      </div>
    </div>
  );
}

function WeekView({
  days,
  postsByDay,
  onSelect,
}: {
  days: Date[];
  postsByDay: Map<string, CalendarPost[]>;
  onSelect: (p: CalendarPost) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="grid grid-cols-7 divide-x divide-white/[0.06]">
        {days.map((day) => {
          const isToday = dateKey(day) === dateKey(new Date());
          const dayPosts = postsByDay.get(dateKey(day)) ?? [];
          return (
            <div key={dateKey(day)} className="flex flex-col">
              <div
                className={`border-b border-white/[0.08] p-3 text-center ${
                  isToday ? "bg-violet-500/10" : "bg-white/[0.02]"
                }`}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div
                  className={`mt-1 text-lg font-bold ${
                    isToday ? "text-violet-400" : "text-white"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
              <div className="flex min-h-[460px] flex-1 flex-col gap-2 p-2 bg-[#0e0e1a]/30">
                {dayPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => onSelect(post)}
                    className="group w-full rounded-xl border border-white/[0.08] bg-[#141424] p-2.5 text-left transition hover:border-violet-500/40 hover:bg-[#19192e]"
                  >
                    <div className="flex items-center justify-between">
                      <PlatformDot platform={post.platform} />
                      <span className="text-[10px] text-white/40">
                        {post.scheduled_at
                          ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                          : ""}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-semibold text-white/90 group-hover:text-violet-200">
                      {post.title}
                    </p>
                    <div className="mt-2">
                      <PostStatusBadge status={post.status} />
                    </div>
                  </button>
                ))}
                {dayPosts.length === 0 && (
                  <Link
                    href={`/posts/new?scheduled=${encodeURIComponent(createAtNine(day).toISOString())}&status=SCHEDULED`}
                    className="flex min-h-[80px] items-center justify-center rounded-xl border border-dashed border-white/10 text-xs font-medium text-white/30 hover:border-violet-500/40 hover:text-white/60 transition"
                  >
                    + Add
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlatformDot({ platform }: { platform: Platform }) {
  const label =
    platform === "INSTAGRAM"
      ? "IG"
      : platform === "FACEBOOK"
      ? "FB"
      : platform === "LINKEDIN"
      ? "IN"
      : "X";
  const colors: Record<string, string> = {
    INSTAGRAM: "bg-pink-600/90 text-white",
    FACEBOOK: "bg-blue-600/90 text-white",
    LINKEDIN: "bg-sky-600/90 text-white",
    X: "bg-neutral-700 text-white",
  };
  return (
    <span
      className={`inline-flex h-4 min-w-4 items-center justify-center rounded px-1 text-[9px] font-bold ${
        colors[platform] || "bg-white/10 text-white"
      }`}
    >
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: PostStatus }) {
  const colors: Record<string, string> = {
    PUBLISHED: "bg-emerald-400",
    FAILED: "bg-red-400",
    SCHEDULED: "bg-amber-400",
    DRAFT: "bg-white/30",
  };
  return <span className={`h-1.5 w-1.5 rounded-full ${colors[status] || "bg-white/30"}`} />;
}

function PostDetailsModal({
  post,
  onClose,
  onPublish,
}: {
  post: CalendarPost;
  onClose: () => void;
  onPublish: (p: CalendarPost) => void;
}) {
  const [schedule, setSchedule] = useState(() =>
    post.scheduled_at ? toDateTimeLocal(new Date(post.scheduled_at)) : ""
  );
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
      setError(result.error || "Could not reschedule.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0e0e1a] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <PlatformBadge platform={post.platform} />
              <PostStatusBadge status={post.status} />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">{post.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {post.image_url && (
          <div className="mb-4 overflow-hidden rounded-xl border border-white/10">
            <img src={post.image_url} alt="" className="max-h-52 w-full object-cover" />
          </div>
        )}

        <p className="mb-5 text-xs leading-relaxed text-white/70">
          {post.caption || "No caption added yet."}
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Category</p>
            <p className="mt-1 text-xs font-semibold text-white">
              {post.categories?.name || "Uncategorized"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Scheduled</p>
            <p className="mt-1 text-xs font-semibold text-white">
              {post.scheduled_at ? formatDateTime(post.scheduled_at) : "Not scheduled"}
            </p>
          </div>
        </div>

        {post.status === "SCHEDULED" && (
          <div className="mb-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-violet-300">
              <RefreshCw size={13} /> Reschedule Post
            </div>
            <p className="mb-3 text-[11px] text-white/50">Pick a new future date and time for publication.</p>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={schedule}
                min={minDateTime}
                onChange={(e) => setSchedule(e.target.value)}
                className="h-9 flex-1 rounded-xl border border-white/10 bg-[#121222] px-3 text-xs text-white outline-none focus:border-violet-500"
              />
              <button
                disabled={pending}
                onClick={handleReschedule}
                className="inline-flex h-9 items-center rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-violet-500 transition disabled:opacity-50"
              >
                {pending ? "Saving..." : "Save"}
              </button>
            </div>
            {error && <p className="mt-2 text-xs font-medium text-red-400">{error}</p>}
          </div>
        )}

        <div className="flex justify-end gap-2.5 border-t border-white/[0.08] pt-4">
          <Link
            href={`/posts/${post.id}/edit`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
          >
            <ExternalLink size={13} /> Edit Post
          </Link>
          {post.status === "SCHEDULED" && (
            <button
              onClick={() => onPublish(post)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <Send size={13} /> Simulate Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
