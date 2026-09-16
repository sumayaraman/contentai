/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FileText, FolderOpen, Plus, SearchX } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { PostsToolbar } from "@/components/posts/posts-toolbar";
import { PostActions } from "@/components/posts/post-actions";
import { PostStatusBadge } from "@/components/posts/post-status";
import { PlatformBadge } from "@/components/posts/platform-badge";
import type { Category, Post } from "@/types/database";

export const dynamic = "force-dynamic";

function isNextRouterSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null && "digest" in err) {
    const digest = String((err as { digest: unknown }).digest);
    return digest.startsWith("NEXT_REDIRECT") || digest.includes("DYNAMIC_SERVER_USAGE");
  }
  return false;
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = getParam(params.search) || "";
  const platform = getParam(params.platform) || "";
  const status = getParam(params.status) || "";
  const category = getParam(params.category) || "";
  const sort = getParam(params.sort) || "newest";
  const saved = getParam(params.saved) || "";

  let list: Post[] = [];
  let categoryList: Category[] = [];

  try {
    const { supabase, workspaceId } = await getActiveWorkspace();

    let query = supabase
      .from("posts")
      .select(
        "id, workspace_id, created_by, title, caption, platform, status, category_id, cta, hashtags, image_url, image_prompt, scheduled_at, published_at, created_at, updated_at, categories!posts_category_id_fkey(name, color)"
      )
      .eq("workspace_id", workspaceId);

    if (platform) query = query.eq("platform", platform);
    if (status) query = query.eq("status", status);
    if (category) query = query.eq("category_id", category);
    if (search)
      query = query.or(
        `title.ilike.%${search.replace(/[%,()]/g, "").replace(/'/g, "''")}%,caption.ilike.%${search.replace(/[%,()]/g, "").replace(/'/g, "''")}%`
      );

    if (sort === "oldest") query = query.order("created_at", { ascending: true });
    else if (sort === "scheduled")
      query = query.order("scheduled_at", { ascending: true, nullsFirst: false });
    else if (sort === "title") query = query.order("title", { ascending: true });
    else query = query.order("created_at", { ascending: false });

    const [{ data: posts }, { data: categories }] = await Promise.all([
      query.limit(100),
      supabase
        .from("categories")
        .select("id, workspace_id, name, color, created_at")
        .eq("workspace_id", workspaceId)
        .order("name", { ascending: true }),
    ]);

    if (posts) list = posts as unknown as Post[];
    if (categories) categoryList = categories as Category[];
  } catch (err) {
    if (isNextRouterSignal(err)) throw err;
    console.warn("Non-fatal error in PostsPage:", err);
  }

  const savedMessages: Record<string, string> = {
    created: "Post created successfully.",
    updated: "Post updated successfully.",
    deleted: "Post deleted successfully.",
    duplicated: "Post duplicated as a draft.",
  };

  return (
    <div className="page animate-fade-up">
      <div className="mx-auto max-w-7xl space-y-6 pb-20">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">
              ✦ Content Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Posts
            </h1>
            <p className="text-xs sm:text-sm text-white/50">
              Create, organize, and manage your multi-channel social content in one place.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/posts/categories"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
            >
              <FolderOpen size={14} />
              <span>Categories</span>
            </Link>
            <Link
              href="/posts/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition"
            >
              <Plus size={14} />
              <span>Create Post</span>
            </Link>
          </div>
        </div>

        {/* Success Alert */}
        {savedMessages[saved] && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-300">
            {savedMessages[saved]}
          </div>
        )}

        {/* Toolbar */}
        <PostsToolbar
          categories={categoryList}
          values={{ search, platform, status, category, sort }}
        />

        {/* Posts Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 shadow-xl overflow-hidden">
          {list.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-3 shadow-inner">
                {search || platform || status || category ? (
                  <SearchX size={20} />
                ) : (
                  <FileText size={20} />
                )}
              </div>
              <h3 className="text-sm font-semibold text-white">
                {search || platform || status || category
                  ? "No posts match your filters"
                  : "No posts created yet"}
              </h3>
              <p className="mt-1 text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                {search || platform || status || category
                  ? "Try resetting your search query or adjusting your filter criteria."
                  : "Create your first draft post or generate an automated batch using AI Studio."}
              </p>
              <div className="mt-4">
                {search || platform || status || category ? (
                  <Link
                    href="/posts"
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    Clear Filters
                  </Link>
                ) : (
                  <Link
                    href="/posts/new"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-500/20 hover:bg-violet-500 transition"
                  >
                    <Plus size={14} />
                    <span>Create First Post</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Desktop Table Header */}
              <div className="hidden lg:grid grid-cols-12 px-6 py-3 border-b border-white/[0.06] bg-white/[0.015] text-[10.5px] uppercase tracking-wider font-semibold text-white/40">
                <div className="col-span-5">Post Content</div>
                <div className="col-span-2">Platform</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/[0.04]">
                {list.map((post) => {
                  const cat = categoryList.find((item) => item.id === post.category_id);
                  return (
                    <div
                      key={post.id}
                      className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 items-start lg:items-center px-5 py-4 sm:px-6 hover:bg-white/[0.02] transition"
                    >
                      {/* Post Info */}
                      <div className="lg:col-span-5 flex items-center gap-3.5 min-w-0 w-full">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#141426] border border-white/10 overflow-hidden">
                          {post.image_url ? (
                            <img
                              src={post.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText size={16} className="text-white/30" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/posts/${post.id}/edit`}
                            className="text-xs sm:text-sm font-semibold text-white hover:text-violet-300 transition truncate block"
                          >
                            {post.title}
                          </Link>
                          <p className="text-[11.5px] text-white/40 line-clamp-1 mt-0.5">
                            {post.caption || "No caption added"}
                          </p>
                        </div>
                      </div>

                      {/* Platform */}
                      <div className="lg:col-span-2">
                        <PlatformBadge platform={post.platform} />
                      </div>

                      {/* Category */}
                      <div className="lg:col-span-2">
                        {cat ? (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              border: `1px solid ${cat.color}35`,
                              color: "#fff",
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="truncate max-w-[120px]">{cat.name}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-white/35">Uncategorized</span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="lg:col-span-1">
                        <PostStatusBadge status={post.status} />
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-2 w-full lg:w-auto flex items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-0 border-white/[0.04]">
                        <span className="text-[11px] text-white/35 font-mono lg:hidden">
                          {post.scheduled_at
                            ? new Date(post.scheduled_at).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            : "Draft"}
                        </span>
                        <PostActions postId={post.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
