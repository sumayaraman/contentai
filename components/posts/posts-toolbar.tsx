"use client";
import { Filter, Search, SlidersHorizontal, Tag } from "lucide-react";
import type { Category } from "@/types/database";

export function PostsToolbar({
  categories,
  values,
}: {
  categories: Category[];
  values: { search?: string; platform?: string; status?: string; category?: string; sort?: string };
}) {
  return (
    <form
      className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-3 sm:p-4 backdrop-blur-xl shadow-sm"
      method="get"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-white/10 bg-[#121222] px-3.5 transition focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
          <Search size={15} className="shrink-0 text-white/40" />
          <input
            name="search"
            defaultValue={values.search}
            placeholder="Search by title or caption keywords..."
            className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-white placeholder:text-white/30 outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
          {/* Platform */}
          <div className="flex h-10 w-full min-w-0 lg:w-auto lg:min-w-36 items-center gap-2 rounded-xl border border-white/10 bg-[#121222] px-3 focus-within:border-violet-500">
            <Filter size={13} className="shrink-0 text-white/40" />
            <select
              name="platform"
              aria-label="Filter by platform"
              defaultValue={values.platform || ""}
              className="w-full min-w-0 appearance-none bg-transparent text-xs text-white outline-none cursor-pointer"
            >
              <option value="" className="bg-[#141426] text-white">All platforms</option>
              <option value="INSTAGRAM" className="bg-[#141426] text-white">Instagram</option>
              <option value="FACEBOOK" className="bg-[#141426] text-white">Facebook</option>
              <option value="LINKEDIN" className="bg-[#141426] text-white">LinkedIn</option>
              <option value="X" className="bg-[#141426] text-white">X</option>
            </select>
          </div>

          {/* Status */}
          <select
            name="status"
            aria-label="Filter by status"
            defaultValue={values.status || ""}
            className="h-10 w-full min-w-0 lg:w-auto lg:min-w-32 rounded-xl border border-white/10 bg-[#121222] px-3 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="" className="bg-[#141426] text-white">All statuses</option>
            <option value="DRAFT" className="bg-[#141426] text-white">Draft</option>
            <option value="SCHEDULED" className="bg-[#141426] text-white">Scheduled</option>
            <option value="PUBLISHED" className="bg-[#141426] text-white">Published</option>
            <option value="FAILED" className="bg-[#141426] text-white">Failed</option>
          </select>

          {/* Category */}
          <div className="flex h-10 w-full min-w-0 lg:w-auto lg:min-w-36 items-center gap-2 rounded-xl border border-white/10 bg-[#121222] px-3 focus-within:border-violet-500">
            <Tag size={13} className="shrink-0 text-white/40" />
            <select
              name="category"
              aria-label="Filter by category"
              defaultValue={values.category || ""}
              className="w-full min-w-0 appearance-none bg-transparent text-xs text-white outline-none cursor-pointer"
            >
              <option value="" className="bg-[#141426] text-white">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-[#141426] text-white">
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            name="sort"
            aria-label="Sort posts"
            defaultValue={values.sort || "newest"}
            className="h-10 w-full min-w-0 lg:w-auto lg:min-w-32 rounded-xl border border-white/10 bg-[#121222] px-3 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="newest" className="bg-[#141426] text-white">Newest first</option>
            <option value="oldest" className="bg-[#141426] text-white">Oldest first</option>
            <option value="scheduled" className="bg-[#141426] text-white">Scheduled date</option>
            <option value="title" className="bg-[#141426] text-white">Title A-Z</option>
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/80 hover:bg-white/[0.08] hover:text-white transition cursor-pointer shrink-0"
        >
          <SlidersHorizontal size={13} />
          <span>Apply</span>
        </button>
      </div>
    </form>
  );
}
