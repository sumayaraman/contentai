/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FileText, FolderOpen, Plus, SearchX } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { PostsToolbar } from "@/components/posts/posts-toolbar";
import { PostActions } from "@/components/posts/post-actions";
import { PostStatusBadge } from "@/components/posts/post-status";
import { PlatformBadge } from "@/components/posts/platform-badge";
import type { Category, Post } from "@/types/database";

function getParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function PostsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const search = getParam(params.search) || "";
  const platform = getParam(params.platform) || "";
  const status = getParam(params.status) || "";
  const category = getParam(params.category) || "";
  const sort = getParam(params.sort) || "newest";
  const saved = getParam(params.saved) || "";
  const { supabase, workspaceId } = await getActiveWorkspace();

  let query = supabase.from("posts").select("id, workspace_id, created_by, title, caption, platform, status, category_id, cta, hashtags, image_url, image_prompt, scheduled_at, published_at, created_at, updated_at, categories!posts_category_id_fkey(name, color)").eq("workspace_id", workspaceId);
  if (platform) query = query.eq("platform", platform);
  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category_id", category);
  if (search) query = query.or(`title.ilike.%${search.replace(/[%,()]/g, "").replace(/'/g, "''")}%,caption.ilike.%${search.replace(/[%,()]/g, "").replace(/'/g, "''")}%`);
  if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (sort === "scheduled") query = query.order("scheduled_at", { ascending: true, nullsFirst: false });
  else if (sort === "title") query = query.order("title", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const [{ data: posts, error: postsError }, { data: categories, error: categoriesError }] = await Promise.all([
    query.limit(100),
    supabase.from("categories").select("id, workspace_id, name, color, created_at").eq("workspace_id", workspaceId).order("name", { ascending: true }),
  ]);
  if (postsError) throw new Error(postsError.message);
  if (categoriesError) throw new Error(categoriesError.message);

  const list = (posts ?? []) as unknown as Post[];
  const categoryList = (categories ?? []) as Category[];
  const savedMessages: Record<string, string> = {
    created: "Post created successfully.",
    updated: "Post updated successfully.",
    deleted: "Post deleted successfully.",
    duplicated: "Post duplicated as a draft.",
  };

  return (
    <div className="page animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="ai-tag" style={{ marginBottom: 6 }}>Content management</p>
          <h1 className="page-title">Posts</h1>
          <p className="page-subtitle">Create, organize, and manage your social content in one place.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/posts/categories" className="btn btn-primary">
            <FolderOpen size={15} /> Categories
          </Link>
          <Link href="/posts/new" className="btn btn-ai">
            <Plus size={15} /> Create Post
          </Link>
        </div>
      </div>

      {/* Success message */}
      {savedMessages[saved] && (
        <div className="badge badge-success" style={{ padding: '10px 16px', borderRadius: 'var(--r-md)', fontSize: 13, marginBottom: 16, display: 'block' }}>
          {savedMessages[saved]}
        </div>
      )}

      {/* Toolbar */}
      <PostsToolbar categories={categoryList} values={{ search, platform, status, category, sort }} />

      {/* Table */}
      <div className="card" style={{ marginTop: 16, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.8fr) 150px 150px 150px 130px 110px',
          gap: 16,
          padding: '10px 20px',
          borderBottom: '1px solid var(--border)',
          fontSize: 10.5,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted)',
        }} className="hidden lg:grid">
          <div>Post</div>
          <div>Platform</div>
          <div>Category</div>
          <div>Status</div>
          <div>Schedule</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {/* Empty state */}
        {list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {search || platform || status || category ? <SearchX size={20} /> : <FileText size={20} />}
            </div>
            <p className="empty-title">
              {search || platform || status || category ? "No posts match your filters" : "No posts yet"}
            </p>
            <p className="empty-desc">
              {search || platform || status || category
                ? "Try changing your search or filters."
                : "Create your first post to start building your content library."}
            </p>
            {search || platform || status || category
              ? <Link href="/posts" className="btn btn-primary">Clear filters</Link>
              : <Link href="/posts/new" className="btn btn-ai"><Plus size={15} /> Create your first post</Link>
            }
          </div>
        ) : (
          <div>
            {list.map((post) => {
              const cat = categoryList.find((item) => item.id === post.category_id);
              return (
                <div key={post.id} style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0,1.8fr) 150px 150px 150px 130px 110px',
                  gap: 16,
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  alignItems: 'center',
                  transition: 'background 0.12s',
                }} className="lg:grid hover:bg-white/5">
                  {/* Post info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--r-md)',
                      background: 'var(--bg-elevated)', flexShrink: 0, overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {post.image_url
                        ? <img src={post.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <FileText size={16} color="var(--text-muted)" />
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <Link href={`/posts/${post.id}/edit`} style={{
                        display: 'block', fontSize: 13, fontWeight: 600,
                        color: 'var(--text-primary)', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {post.title}
                      </Link>
                      <p style={{
                        marginTop: 3, fontSize: 11.5, color: 'var(--text-secondary)',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {post.caption || "No caption added yet."}
                      </p>
                    </div>
                  </div>

                  <PlatformBadge platform={post.platform} />

                  <div>
                    {cat
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                          {cat.name}
                        </span>
                      : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Uncategorized</span>
                    }
                  </div>

                  <div><PostStatusBadge status={post.status} /></div>

                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "Not scheduled"}
                  </div>

                  <PostActions postId={post.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
