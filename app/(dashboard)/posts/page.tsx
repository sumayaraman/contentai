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
  const savedMessages: Record<string, string> = { created: "Post created successfully.", updated: "Post updated successfully.", deleted: "Post deleted successfully.", duplicated: "Post duplicated as a draft." };

  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-blue-600">Content management</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Posts</h1><p className="mt-1 text-sm text-slate-500">Create, organize, and manage your social content in one place.</p></div><div className="flex gap-2"><Link href="/posts/categories" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"><FolderOpen size={16} /> Categories</Link><Link href="/posts/new" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"><Plus size={17} /> Create Post</Link></div></div>
    {savedMessages[saved] && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{savedMessages[saved]}</div>}
    <PostsToolbar categories={categoryList} values={{ search, platform, status, category, sort }} />
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,1.8fr)_150px_150px_150px_130px_110px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid"><div>Post</div><div>Platform</div><div>Category</div><div>Status</div><div>Schedule</div><div className="text-right">Actions</div></div>
      {list.length === 0 ? <div className="px-5 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">{search || platform || status || category ? <SearchX size={21} className="text-slate-400" /> : <FileText size={21} className="text-slate-400" />}</div><h2 className="mt-4 text-base font-semibold text-slate-900">{search || platform || status || category ? "No posts match your filters" : "No posts yet"}</h2><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{search || platform || status || category ? "Try changing your search or filters." : "Create your first post to start building your content library."}</p>{search || platform || status || category ? <Link href="/posts" className="mt-4 inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear filters</Link> : <Link href="/posts/new" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={16} /> Create your first post</Link>}</div> : <div className="divide-y divide-slate-100">{list.map((post) => { const cat = categoryList.find((item) => item.id === post.category_id); return <div key={post.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.8fr)_150px_150px_150px_130px_110px] lg:items-center"><div className="flex min-w-0 items-center gap-3"><div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:block">{post.image_url ? <img src={post.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><FileText size={18} className="text-slate-400" /></div>}</div><div className="min-w-0"><Link href={`/posts/${post.id}/edit`} className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{post.title}</Link><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{post.caption || "No caption added yet."}</p></div></div><PlatformBadge platform={post.platform} /><div>{cat ? <span className="inline-flex items-center gap-2 text-sm text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}</span> : <span className="text-sm text-slate-400">Uncategorized</span>}</div><div><PostStatusBadge status={post.status} /></div><div className="text-xs text-slate-500">{post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "Not scheduled"}</div><PostActions postId={post.id} /></div> })}</div>}
    </div>
  </div>;
}
