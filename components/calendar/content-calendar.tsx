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

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  color: 'var(--text-primary)',
  padding: '6px 10px',
  fontSize: 12.5,
  outline: 'none',
  cursor: 'pointer',
};

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
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  function navigate(direction: number) {
    setCursor((c) => view === "month" ? addMonths(c, direction) : addDays(c, direction * 7));
  }

  async function handlePublish(post: CalendarPost) {
    const formData = new FormData();
    formData.set("post_id", post.id);
    const result = await simulatePublishPost(formData);
    setToast(result.ok ? result.message || "Published." : result.error || "Could not publish.");
    if (result.ok) window.location.reload();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {toast && (
        <div className="badge badge-success" style={{ padding: '10px 16px', borderRadius: 'var(--r-md)', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{toast}</span>
          <button onClick={() => setToast("")} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={15} /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {/* Left: nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setCursor(startOfDay(new Date()))} className="btn btn-primary btn-sm">Today</button>
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
              <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ borderRadius: 0, padding: '6px 10px' }}><ChevronLeft size={16} /></button>
              <button onClick={() => navigate(1)} className="btn btn-ghost btn-sm" style={{ borderRadius: 0, borderLeft: '1px solid var(--border)', padding: '6px 10px' }}><ChevronRight size={16} /></button>
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {view === "month" ? monthLabel(cursor) : weekLabel(cursor)}
            </h2>
          </div>

          {/* Right: filters + view toggle */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...selectStyle, padding: '5px 10px' }}>
              <Filter size={13} style={{ color: 'var(--text-muted)' }} />
              <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform | "ALL")} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: 12.5, cursor: 'pointer' }}>
                {platformOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as PostStatus | "ALL")} style={selectStyle}>
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
              <option value="ALL">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: 3, gap: 2 }}>
              {(['month', 'week'] as ViewMode[]).map((v) => (
                <button key={v} onClick={() => setView(v)} className={view === v ? 'btn btn-ai btn-sm' : 'btn btn-ghost btn-sm'} style={{ textTransform: 'capitalize', padding: '4px 12px' }}>{v}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      {view === "month"
        ? <MonthView days={monthDays} cursor={cursor} postsByDay={postsByDay} onSelect={setSelectedPost} />
        : <WeekView days={weekDays} postsByDay={postsByDay} onSelect={setSelectedPost} />
      }

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
        <span>{filteredPosts.length} scheduled item{filteredPosts.length === 1 ? "" : "s"}</span>
        <Link href="/posts/new" style={{ color: '#a89dff', fontWeight: 600 }}>+ Create Post</Link>
      </div>

      {selectedPost && <PostDetailsModal post={selectedPost} onClose={() => setSelectedPost(null)} onPublish={handlePublish} />}
    </div>
  );
}

function MonthView({ days, cursor, postsByDay, onSelect }: { days: Date[]; cursor: Date; postsByDay: Map<string, CalendarPost[]>; onSelect: (p: CalendarPost) => void }) {
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i).toLocaleDateString(undefined, { weekday: "short" }));
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        {weekdays.map((d) => (
          <div key={d} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day) => (
          <CalendarDay key={dateKey(day)} day={day} inMonth={day.getMonth() === cursor.getMonth()} posts={postsByDay.get(dateKey(day)) ?? []} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function CalendarDay({ day, inMonth, posts, onSelect }: { day: Date; inMonth: boolean; posts: CalendarPost[]; onSelect: (p: CalendarPost) => void }) {
  const today = dateKey(day) === dateKey(new Date());
  return (
    <div style={{
      minHeight: 120,
      borderBottom: '1px solid var(--border-subtle)',
      borderRight: '1px solid var(--border-subtle)',
      padding: 8,
      background: inMonth ? 'var(--bg-surface)' : 'var(--bg-base)',
      transition: 'background 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Link
          href={`/posts/new?scheduled=${encodeURIComponent(createAtNine(day).toISOString())}&status=SCHEDULED`}
          style={{
            width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600,
            background: today ? 'var(--accent)' : 'transparent',
            color: today ? '#fff' : inMonth ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: today ? '0 0 10px var(--accent-glow)' : 'none',
          }}
        >{day.getDate()}</Link>
        <Link href={`/posts/new?scheduled=${encodeURIComponent(createAtNine(day).toISOString())}&status=SCHEDULED`} style={{ color: 'var(--text-muted)', display: 'flex' }}>
          <CalendarPlus size={13} />
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {posts.slice(0, 3).map((post) => (
          <button key={post.id} onClick={() => onSelect(post)} style={{
            width: '100%', textAlign: 'left', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-accent)', borderRadius: 'var(--r-sm)',
            padding: '4px 6px', cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PlatformDot platform={post.platform} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}</span>
              <StatusDot status={post.status} />
            </div>
          </button>
        ))}
        {posts.length > 3 && <span style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 2 }}>+{posts.length - 3} more</span>}
      </div>
    </div>
  );
}

function WeekView({ days, postsByDay, onSelect }: { days: Date[]; postsByDay: Map<string, CalendarPost[]>; onSelect: (p: CalendarPost) => void }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day) => {
          const isToday = dateKey(day) === dateKey(new Date());
          const dayPosts = postsByDay.get(dateKey(day)) ?? [];
          return (
            <div key={dateKey(day)} style={{ borderRight: '1px solid var(--border-subtle)' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', background: isToday ? 'rgba(109,92,255,0.08)' : 'var(--bg-surface)' }}>
                <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: isToday ? '#a89dff' : 'var(--text-primary)', marginTop: 2 }}>
                  {day.getDate()}
                </div>
              </div>
              <div style={{ minHeight: 480, padding: 8, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-base)' }}>
                {dayPosts.map((post) => (
                  <button key={post.id} onClick={() => onSelect(post)} style={{
                    width: '100%', textAlign: 'left', background: 'var(--bg-surface)',
                    border: '1px solid var(--border-accent)', borderRadius: 'var(--r-md)',
                    padding: 10, cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <PlatformDot platform={post.platform} />
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                        {post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                    <p style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{post.title}</p>
                    <div style={{ marginTop: 6 }}><PostStatusBadge status={post.status} /></div>
                  </button>
                ))}
                {dayPosts.length === 0 && (
                  <Link href={`/posts/new?scheduled=${encodeURIComponent(createAtNine(day).toISOString())}&status=SCHEDULED`} style={{
                    display: 'flex', minHeight: 80, alignItems: 'center', justifyContent: 'center',
                    border: '1px dashed var(--border)', borderRadius: 'var(--r-md)',
                    fontSize: 11.5, color: 'var(--text-muted)', textDecoration: 'none',
                  }}>+ Create post</Link>
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
  const label = platform === "INSTAGRAM" ? "IG" : platform === "FACEBOOK" ? "FB" : platform === "LINKEDIN" ? "IN" : "X";
  const colors: Record<string, string> = { INSTAGRAM: '#e1306c', FACEBOOK: '#1877f2', LINKEDIN: '#0a66c2', X: '#888' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: 18, minWidth: 18, borderRadius: 4, padding: '0 4px',
      background: colors[platform] || 'var(--bg-elevated)',
      fontSize: 9, fontWeight: 700, color: '#fff',
    }}>{label}</span>
  );
}

function StatusDot({ status }: { status: PostStatus }) {
  const colors: Record<string, string> = { PUBLISHED: 'var(--green)', FAILED: 'var(--red)', SCHEDULED: 'var(--amber)', DRAFT: 'var(--text-muted)' };
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors[status] || 'var(--text-muted)', display: 'inline-block' }} />;
}

function PostDetailsModal({ post, onClose, onPublish }: { post: CalendarPost; onClose: () => void; onPublish: (p: CalendarPost) => void }) {
  const [schedule, setSchedule] = useState(() => post.scheduled_at ? toDateTimeLocal(new Date(post.scheduled_at)) : "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [minDateTime] = useState(() => toDateTimeLocal(new Date(Date.now() + 60000)));

  async function handleReschedule() {
    setPending(true); setError("");
    const formData = new FormData();
    formData.set("post_id", post.id);
    const parsed = new Date(schedule);
    formData.set("scheduled_at", Number.isNaN(parsed.getTime()) ? schedule : parsed.toISOString());
    const result = await reschedulePost(formData);
    setPending(false);
    if (!result.ok) { setError(result.error || "Could not reschedule."); return; }
    window.location.reload();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border-accent)', borderRadius: 'var(--r-xl)', padding: 24, boxShadow: 'var(--shadow-glow)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <PlatformBadge platform={post.platform} />
              <PostStatusBadge status={post.status} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{post.title}</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 6 }}><X size={16} /></button>
        </div>

        {post.image_url && (
          <div style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: 16 }}>
            <img src={post.image_url} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
          </div>
        )}

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{post.caption || "No caption added yet."}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Category</p>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{post.categories?.name || "Uncategorized"}</p>
          </div>
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>Scheduled</p>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{post.scheduled_at ? formatDateTime(post.scheduled_at) : "Not scheduled"}</p>
          </div>
        </div>

        {post.status === "SCHEDULED" && (
          <div style={{ border: '1px solid var(--border-accent)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              <RefreshCw size={13} /> Reschedule
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 10 }}>Choose a future date and time.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="datetime-local" value={schedule} min={minDateTime} onChange={(e) => setSchedule(e.target.value)}
                className="ai-input" style={{ flex: 1, padding: '7px 10px', fontSize: 13 }} />
              <button disabled={pending} onClick={handleReschedule} className="btn btn-ai btn-sm">
                {pending ? "Saving..." : "Save"}
              </button>
            </div>
            {error && <p style={{ marginTop: 8, fontSize: 12, color: 'var(--red)' }}>{error}</p>}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Link href={`/posts/${post.id}/edit`} className="btn btn-primary btn-sm">
            <ExternalLink size={13} /> Edit post
          </Link>
          {post.status === "SCHEDULED" && (
            <button onClick={() => onPublish(post)} className="btn btn-sm" style={{ background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <Send size={13} /> Simulate publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
