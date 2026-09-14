"use client";

import { useState, useTransition } from "react";
import { Check, FolderPlus, Palette, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "@/lib/content/actions";
import type { Category } from "@/types/database";

const PRESET_COLORS = [
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Fuchsia", hex: "#d946ef" },
];

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editColor, setEditColor] = useState<string>("#8b5cf6");
  const [selectedColor, setSelectedColor] = useState<string>("#8b5cf6");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function startEditingCategory(cat: Category) {
    setEditing(cat.id);
    setEditColor(cat.color || "#8b5cf6");
  }

  return (
    <div className="space-y-6">
      {/* Create New Category Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.06]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <FolderPlus size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Create New Category</h2>
            <p className="text-[11px] text-white/50">Add a tag and custom color theme to classify your posts.</p>
          </div>
        </div>

        <form
          action={async (formData: FormData) => {
            formData.set("color", selectedColor);
            startTransition(async () => {
              const result = await createCategory(formData);
              if (!result.ok) {
                setMessage({ type: "error", text: result.error || "Could not create category." });
              } else {
                setMessage({ type: "success", text: "Category created successfully." });
                const form = document.getElementById("new-category-form") as HTMLFormElement | null;
                form?.reset();
              }
            });
          }}
          id="new-category-form"
          className="mt-5 space-y-5"
        >
          <div>
            <label htmlFor="cat-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/60">
              Category Name
            </label>
            <input
              id="cat-name"
              name="name"
              maxLength={80}
              placeholder="e.g. Product Updates, Behind the Scenes, Tips & Guides"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#16162a] px-4 text-xs text-white placeholder:text-white/40 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              required
            />
          </div>

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <Palette size={13} className="text-violet-400" /> Color Accent
              </label>
              <span className="text-[11px] font-mono text-white/40">{selectedColor}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {PRESET_COLORS.map((preset) => {
                const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setSelectedColor(preset.hex)}
                    title={preset.name}
                    aria-label={`Select color ${preset.name}`}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-110 ${
                      isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f0f1a] scale-110" : "opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && <Check size={14} className="text-white drop-shadow-md" />}
                  </button>
                );
              })}

              {/* Custom Color Input */}
              <div className="relative flex items-center">
                <label
                  htmlFor="custom-color-picker"
                  className="flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-medium text-white/70 hover:bg-white/[0.08] cursor-pointer transition"
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: selectedColor }}
                  />
                  Custom
                </label>
                <input
                  id="custom-color-picker"
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="sr-only"
                />
              </div>
            </div>
            <input type="hidden" name="color" value={selectedColor} />
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              <Plus size={15} /> Add Category
            </button>
          </div>
        </form>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-white/40 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Category List */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-violet-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Categories List
            </h3>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-white/50">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </span>
        </div>

        <div className="space-y-2.5">
          {categories.map((category) =>
            editing === category.id ? (
              <form
                key={category.id}
                action={async (formData: FormData) => {
                  formData.set("color", editColor);
                  startTransition(async () => {
                    const result = await updateCategory(formData);
                    if (!result.ok) {
                      setMessage({ type: "error", text: result.error || "Could not update category." });
                    } else {
                      setMessage({ type: "success", text: "Category updated." });
                      setEditing(null);
                    }
                  });
                }}
                className="flex flex-col gap-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-4 sm:flex-row sm:items-center"
              >
                <input type="hidden" name="category_id" value={category.id} />
                <input
                  name="name"
                  defaultValue={category.name}
                  maxLength={80}
                  className="h-10 flex-1 rounded-xl border border-white/10 bg-[#16162a] px-3.5 text-xs text-white outline-none focus:border-violet-500"
                  required
                />
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <label
                      htmlFor={`edit-color-${category.id}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#16162a] cursor-pointer"
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white/20"
                        style={{ backgroundColor: editColor }}
                      />
                    </label>
                    <input
                      id={`edit-color-${category.id}`}
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="sr-only"
                    />
                  </div>
                  <input type="hidden" name="color" value={editColor} />
                  <button
                    disabled={isPending}
                    type="submit"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white hover:bg-violet-500 transition"
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white/60 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              </form>
            ) : (
              <div
                key={category.id}
                className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/15 hover:bg-white/[0.04]"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full ring-2 ring-white/10 shadow-sm transition-transform group-hover:scale-110"
                    style={{ backgroundColor: category.color, boxShadow: `0 0 10px ${category.color}44` }}
                  />
                  <div>
                    <div className="truncate text-xs font-semibold text-white">{category.name}</div>
                    <div className="text-[10px] font-mono text-white/40">{category.color}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`Edit ${category.name}`}
                    onClick={() => startEditingCategory(category)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.08] hover:text-white transition"
                    title="Edit category"
                  >
                    <Pencil size={13} />
                  </button>
                  <form
                    action={async (formData: FormData) => {
                      if (!window.confirm(`Delete "${category.name}"? Posts using it will become uncategorized.`)) return;
                      startTransition(async () => {
                        const result = await deleteCategory(formData);
                        if (!result.ok) setMessage({ type: "error", text: result.error || "Could not delete category." });
                        else setMessage({ type: "success", text: "Category deleted." });
                      });
                    }}
                  >
                    <input type="hidden" name="category_id" value={category.id} />
                    <button
                      aria-label={`Delete ${category.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition"
                      title="Delete category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
            )
          )}

          {categories.length === 0 && (
            <div className="py-12 text-center">
              <Tag size={28} className="mx-auto text-white/20" />
              <p className="mt-3 text-xs font-semibold text-white/60">No categories created yet</p>
              <p className="mt-1 text-[11px] text-white/40">Use the form above to add your first post classification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
