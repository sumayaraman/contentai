"use client";
import { Filter, Plus, Search, SlidersHorizontal, Tag } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types/database";

export function PostsToolbar({ categories, values }: { categories: Category[]; values: { search?: string; platform?: string; status?: string; category?: string; sort?: string } }) {
  return (
    <form className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-3.5 backdrop-blur-xl shadow-sm" method="get">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

        {/* Search */}
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 transition focus-within:border-violet-500 focus-within:bg-white/[0.05]">
          <Search size={16} className="shrink-0 text-white/40" />
          <input
            name="search"
            defaultValue={values.search}
            placeholder="Search titles and captions..."
            className="w-full min-w-0 bg-transparent text-xs text-white placeholder:text-white/40 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">

          {/* Platform */}
          <div className="flex h-10 min-w-36 items-center gap-2 rounded-xl border border-white/10 bg-[#16162a] px-3 focus-within:border-violet-500">
            <Filter size={13} className="shrink-0 text-white/40" />
            <select
              name="platform"
              defaultValue={values.platform || ""}
              className="w-full min-w-0 appearance-none bg-transparent text-xs text-white outline-none cursor-pointer"
            >
              <option value="" className="bg-[#16162a] text-white">All platforms</option>
              <option value="INSTAGRAM" className="bg-[#16162a] text-white">Instagram</option>
              <option value="FACEBOOK" className="bg-[#16162a] text-white">Facebook</option>
              <option value="LINKEDIN" className="bg-[#16162a] text-white">LinkedIn</option>
              <option value="X" className="bg-[#16162a] text-white">X</option>
            </select>
          </div>

          {/* Status */}
          <select
            name="status"
            defaultValue={values.status || ""}
            className="h-10 min-w-32 rounded-xl border border-white/10 bg-[#16162a] px-3 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="" className="bg-[#16162a] text-white">All statuses</option>
            <option value="DRAFT" className="bg-[#16162a] text-white">Draft</option>
            <option value="SCHEDULED" className="bg-[#16162a] text-white">Scheduled</option>
            <option value="PUBLISHED" className="bg-[#16162a] text-white">Published</option>
            <option value="FAILED" className="bg-[#16162a] text-white">Failed</option>
          </select>

          {/* Category */}
          <div className="flex h-10 min-w-36 items-center gap-2 rounded-xl border border-white/10 bg-[#16162a] px-3 focus-within:border-violet-500">
            <Tag size={13} className="shrink-0 text-white/40" />
            <select
              name="category"
              defaultValue={values.category || ""}
              className="w-full min-w-0 appearance-none bg-transparent text-xs text-white outline-none cursor-pointer"
            >
              <option value="" className="bg-[#16162a] text-white">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-[#16162a] text-white">{category.name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            name="sort"
            defaultValue={values.sort || "newest"}
            className="h-10 min-w-32 rounded-xl border border-white/10 bg-[#16162a] px-3 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="newest" className="bg-[#16162a] text-white">Newest</option>
            <option value="oldest" className="bg-[#16162a] text-white">Oldest</option>
            <option value="scheduled" className="bg-[#16162a] text-white">Scheduled date</option>
            <option value="title" className="bg-[#16162a] text-white">Title</option>
          </select>
        </div>

        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition">
          <SlidersHorizontal size={14} /> Apply
        </button>
        <Link href="/posts/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition">
          <Plus size={15} /> Create Post
        </Link>
      </div>
    </form>
  );
}

