"use client";

import { Filter, Plus, Search, SlidersHorizontal, Tag } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types/database";

export function PostsToolbar({ categories, values }: { categories: Category[]; values: { search?: string; platform?: string; status?: string; category?: string; sort?: string } }) {
  return <form className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" method="get">
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative min-w-0 flex-1"><Search size={17} className="absolute left-3 top-2.5 text-slate-400" /><input name="search" defaultValue={values.search} placeholder="Search titles and captions..." className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white" /></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
        <label className="relative"><Filter size={14} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><select name="platform" defaultValue={values.platform || ""} className="h-10 min-w-36 appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-700 outline-none focus:border-blue-400"><option value="">All platforms</option><option value="INSTAGRAM">Instagram</option><option value="FACEBOOK">Facebook</option><option value="LINKEDIN">LinkedIn</option><option value="X">X</option></select></label>
        <select name="status" defaultValue={values.status || ""} className="h-10 min-w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"><option value="">All statuses</option><option value="DRAFT">Draft</option><option value="SCHEDULED">Scheduled</option><option value="PUBLISHED">Published</option><option value="FAILED">Failed</option></select>
        <label className="relative"><Tag size={14} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><select name="category" defaultValue={values.category || ""} className="h-10 min-w-36 appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-700 outline-none focus:border-blue-400"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <select name="sort" defaultValue={values.sort || "newest"} className="h-10 min-w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="scheduled">Scheduled date</option><option value="title">Title</option></select>
      </div>
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><SlidersHorizontal size={16} /> Apply</button>
      <Link href="/posts/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"><Plus size={17} /> Create Post</Link>
    </div>
  </form>;
}
