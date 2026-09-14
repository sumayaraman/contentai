"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Info,
  RadioTower,
  RefreshCw,
  Send,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { simulatePublish, retryPublish } from "@/lib/publishing/actions";
import { publishRealPost } from "@/lib/social/actions";
import { PlatformBadge } from "@/components/posts/platform-badge";
import { PostStatusBadge } from "@/components/posts/post-status";
import type { Platform, PostStatus } from "@/types/database";
import type { SocialAccount } from "@/lib/social/types";

type Event = {
  id: string;
  post_id: string;
  platform: Platform;
  action: string;
  status: "SUCCESS" | "FAILED";
  external_post_id: string | null;
  message: string | null;
  error_code: string | null;
  attempted_at: string;
};

type Post = {
  id: string;
  title: string;
  caption: string | null;
  platform: Platform;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  image_url: string | null;
};

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";
}

export function PublishingDashboard({
  posts,
  events,
  accounts,
}: {
  posts: Post[];
  events: Event[];
  accounts: SocialAccount[];
}) {
  const latestByPost = new Map<string, Event>();
  for (const event of events) {
    if (!latestByPost.has(event.post_id)) latestByPost.set(event.post_id, event);
  }

  async function run(
    action: typeof simulatePublish | typeof retryPublish,
    postId: string,
    mode?: "SUCCESS" | "FAILURE"
  ) {
    const fd = new FormData();
    fd.set("post_id", postId);
    if (mode) fd.set("simulation_mode", mode);
    const result = await action(fd);
    window.location.reload();
    return result;
  }

  async function realPublish(postId: string, accountId: string) {
    const result = await publishRealPost({ postId, accountId });
    if (!result.ok) window.alert(result.error || "Publishing failed.");
    else window.alert(result.message || "Published successfully.");
    window.location.reload();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1360, margin: "0 auto", width: "100%" }}>
      {/* Notice Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          borderRadius: "var(--r-md)",
          background: "rgba(109,92,255,0.08)",
          border: "1px solid rgba(109,92,255,0.25)",
          color: "var(--text-secondary)",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <RadioTower size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <div>
          <strong style={{ color: "var(--text-primary)" }}>Demo &amp; Multi-Channel Publishing:</strong>{" "}
          Simulated actions run safely without calling third-party APIs. To publish live to your feeds, connect social accounts in{" "}
          <Link href="/settings" style={{ color: "#b0a0ff", textDecoration: "underline" }}>
            Workspace Settings
          </Link>.
        </div>
      </div>

      {/* Main Queue Section */}
      <section
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Card Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Publishing Queue
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "3px 0 0" }}>
              Review scheduled posts, trigger automated test dispatches, or publish live to connected networks.
            </p>
          </div>
          <span
            className="badge"
            style={{
              background: "var(--accent-soft)",
              color: "#b0a0ff",
              border: "1px solid var(--border-accent)",
              fontSize: 11,
              padding: "4px 12px",
            }}
          >
            {posts.length} {posts.length === 1 ? "Post" : "Posts"} in Queue
          </span>
        </div>

        {/* Card Body */}
        {posts.length === 0 ? (
          /* Empty State */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: "rgba(109,92,255,0.1)",
                border: "1px solid rgba(109,92,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
                marginBottom: 16,
              }}
            >
              <Send size={24} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              No Publishable Posts Yet
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                maxWidth: 440,
                margin: "8px 0 24px",
                lineHeight: 1.6,
              }}
            >
              Posts scheduled in the Content Workspace, AI Studio, or Campaigns planner will appear here ready for dispatch.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link
                href="/posts/new"
                className="btn btn-primary btn-sm"
                style={{ gap: 6, padding: "9px 18px" }}
              >
                <Sparkles size={14} /> Create Post
              </Link>
              <Link
                href="/campaigns"
                className="btn btn-ghost btn-sm"
                style={{ gap: 6, padding: "9px 18px" }}
              >
                Plan Campaign
              </Link>
            </div>
          </div>
        ) : (
          /* Posts List */
          <div style={{ display: "flex", flexDirection: "column" }}>
            {posts.map((post) => {
              const event = latestByPost.get(post.id);
              return (
                <div
                  key={post.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.4fr) 140px 160px minmax(260px, 1fr)",
                    gap: 20,
                    alignItems: "center",
                    padding: "18px 24px",
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background 0.15s ease",
                  }}
                  className="hover:bg-white/[0.02]"
                >
                  {/* Thumbnail & Title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "var(--r-md)",
                        overflow: "hidden",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <Send size={18} style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/posts/${post.id}/edit`}
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          textDecoration: "none",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {post.title}
                      </Link>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          margin: "3px 0 0",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.4,
                        }}
                      >
                        {post.caption || "No caption"}
                      </p>
                    </div>
                  </div>

                  {/* Platform & Status Badges */}
                  <div>
                    <PlatformBadge platform={post.platform} />
                    <div style={{ marginTop: 6 }}>
                      <PostStatusBadge status={post.status} />
                    </div>
                  </div>

                  {/* Schedule Timestamps */}
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Scheduled:</span>{" "}
                      {formatDate(post.scheduled_at)}
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Published:</span>{" "}
                      {formatDate(post.published_at)}
                    </div>
                  </div>

                  {/* Event Status & Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {/* Status Alert Box */}
                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "var(--r-md)",
                        fontSize: 11.5,
                        background:
                          event?.status === "FAILED"
                            ? "rgba(239,68,68,0.1)"
                            : event?.status === "SUCCESS"
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(255,255,255,0.03)",
                        border:
                          event?.status === "FAILED"
                            ? "1px solid rgba(239,68,68,0.25)"
                            : event?.status === "SUCCESS"
                            ? "1px solid rgba(34,197,94,0.25)"
                            : "1px solid var(--border)",
                        color:
                          event?.status === "FAILED"
                            ? "#f87171"
                            : event?.status === "SUCCESS"
                            ? "#4ade80"
                            : "var(--text-muted)",
                      }}
                    >
                      {event ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          {event.status === "FAILED" ? (
                            <TriangleAlert size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                          ) : (
                            <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {event.status === "FAILED" ? "Publishing Error" : "Published Successfully"}
                            </div>
                            <div style={{ marginTop: 2 }}>{event.message || "No message logged"}</div>
                            <div style={{ marginTop: 2, opacity: 0.75, fontSize: 10.5 }}>
                              {formatDate(event.attempted_at)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <Clock3 size={13} />
                          <span>No publishing attempt yet</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {/* Real Account Publishing */}
                      {accounts
                        .filter((account) => account.platform === post.platform)
                        .map((account) => (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => void realPublish(post.id, account.id)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 11.5, padding: "4px 10px", gap: 4 }}
                          >
                            Publish to {account.platform === "X" ? "X" : account.platform}
                          </button>
                        ))}

                      {/* Simulation Controls */}
                      {post.status === "SCHEDULED" && (
                        <>
                          <button
                            type="button"
                            onClick={() => run(simulatePublish, post.id, "SUCCESS")}
                            className="btn btn-ghost btn-sm"
                            style={{
                              fontSize: 11.5,
                              padding: "4px 10px",
                              gap: 4,
                              color: "#4ade80",
                              borderColor: "rgba(34,197,94,0.3)",
                            }}
                          >
                            <Send size={12} /> Simulate Success
                          </button>
                          <button
                            type="button"
                            onClick={() => run(simulatePublish, post.id, "FAILURE")}
                            className="btn btn-ghost btn-sm"
                            style={{
                              fontSize: 11.5,
                              padding: "4px 10px",
                              gap: 4,
                              color: "#f87171",
                              borderColor: "rgba(239,68,68,0.3)",
                            }}
                          >
                            <TriangleAlert size={12} /> Simulate Failure
                          </button>
                        </>
                      )}

                      {/* Retry on Failure */}
                      {post.status === "FAILED" && (
                        <button
                          type="button"
                          onClick={() => run(retryPublish, post.id)}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 11.5, padding: "4px 10px", gap: 4 }}
                        >
                          <RefreshCw size={12} /> Retry
                        </button>
                      )}

                      {/* Edit Post Link */}
                      <Link
                        href={`/posts/${post.id}/edit`}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11.5, padding: "4px 10px", gap: 4 }}
                      >
                        <ExternalLink size={12} /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

