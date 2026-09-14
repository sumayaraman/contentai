"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "@/lib/content/actions";
import type { Category } from "@/types/database";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-5">
      <form
        action={async (formData: FormData) => {
          startTransition(async () => {
            const result = await createCategory(formData);
            if (!result.ok) setMessage(result.error || "Could not create category.");
            else setMessage("Category created.");
          });
        }}
        className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-4 backdrop-blur-xl shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">New category</label>
          <input
            name="name"
            maxLength={80}
            placeholder="e.g. Tips & Tricks, Product Updates"
            className="h-10 w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 text-xs text-white placeholder:text-white/40 outline-none focus:border-violet-500"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">Color</label>
          <input
            name="color"
            type="color"
            defaultValue="#8b5cf6"
            className="h-10 w-16 cursor-pointer rounded-xl border border-white/10 bg-[#16162a] p-1"
          />
        </div>
        <button
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
        >
          <Plus size={15} /> Add Category
        </button>
      </form>

      {message && (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-xs font-medium text-violet-300">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 divide-y divide-white/[0.04] backdrop-blur-xl shadow-lg">
        {categories.map((category) =>
          editing === category.id ? (
            <form
              key={category.id}
              action={async (formData: FormData) => {
                startTransition(async () => {
                  const result = await updateCategory(formData);
                  if (!result.ok) setMessage(result.error || "Could not update category.");
                  else {
                    setMessage("Category updated.");
                    setEditing(null);
                  }
                });
              }}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center bg-white/[0.02]"
            >
              <input type="hidden" name="category_id" value={category.id} />
              <input
                name="name"
                defaultValue={category.name}
                maxLength={80}
                className="h-9 flex-1 rounded-xl border border-white/10 bg-[#16162a] px-3 text-xs text-white outline-none focus:border-violet-500"
                required
              />
              <input
                name="color"
                type="color"
                defaultValue={category.color}
                className="h-9 w-14 rounded-xl border border-white/10 bg-[#16162a] p-1"
              />
              <div className="flex items-center gap-2">
                <button
                  disabled={isPending}
                  className="rounded-xl bg-violet-600 p-2 text-white hover:bg-violet-500 transition"
                  aria-label="Save"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-white/60 hover:bg-white/[0.08] hover:text-white transition"
                  aria-label="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            </form>
          ) : (
            <div key={category.id} className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.02] transition">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: category.color }} />
                <span className="truncate text-xs font-semibold text-white/90">{category.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  aria-label={`Edit ${category.name}`}
                  onClick={() => setEditing(category.id)}
                  className="rounded-lg p-2 text-white/40 hover:bg-white/[0.06] hover:text-white transition"
                >
                  <Pencil size={14} />
                </button>
                <form
                  action={async (formData: FormData) => {
                    if (!window.confirm(`Delete ${category.name}? Posts using it will become uncategorized.`)) return;
                    startTransition(async () => {
                      const result = await deleteCategory(formData);
                      if (!result.ok) setMessage(result.error || "Could not delete category.");
                      else setMessage("Category deleted.");
                    });
                  }}
                >
                  <input type="hidden" name="category_id" value={category.id} />
                  <button
                    aria-label={`Delete ${category.name}`}
                    className="rounded-lg p-2 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>
          )
        )}
        {categories.length === 0 && (
          <div className="p-10 text-center text-xs text-white/40">
            No categories yet. Create your first category above.
          </div>
        )}
      </div>
    </div>
  );
}

