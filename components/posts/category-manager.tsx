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

  const activePreset = PRESET_COLORS.find(
    (p) => p.hex.toLowerCase() === selectedColor.toLowerCase()
  );

  return (
    <div className="space-y-12">
      {/* Create New Category Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#101020]/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/40 space-y-8">
        <div className="flex items-center gap-3.5 pb-6 border-b border-white/[0.08]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <FolderPlus size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Create New Category</h2>
            <p className="text-xs text-white/50 mt-0.5">Define a topic name and color accent to categorize your campaigns.</p>
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
          className="space-y-8"
        >
          <div>
            <label htmlFor="cat-name" className="mb-2.5 block text-sm font-medium text-white/80">
              Category Name
            </label>
            <input
              id="cat-name"
              name="name"
              maxLength={80}
              placeholder="e.g. Product Updates, Behind the Scenes, Tips & Tutorials"
              className="h-13 w-full rounded-2xl border border-white/10 bg-[#16162e] px-4 sm:px-5 text-sm text-white placeholder:text-white/35 outline-none transition duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Palette size={16} className="text-violet-400" /> Color Accent
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">{activePreset ? activePreset.name : "Custom"}</span>
                <span className="font-mono text-xs text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
                  {selectedColor}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              {PRESET_COLORS.map((preset) => {
                const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setSelectedColor(preset.hex)}
                    title={preset.name}
                    aria-label={`Select color ${preset.name}`}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#101020] scale-105 shadow-lg"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: preset.hex, boxShadow: isSelected ? `0 0 16px ${preset.hex}88` : undefined }}
                  >
                    {isSelected && <Check size={18} className="text-white drop-shadow-md stroke-[3]" />}
                  </button>
                );
              })}

              {/* Custom Color Input */}
              <div className="relative flex items-center">
                <label
                  htmlFor="custom-color-picker"
                  className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-white/80 hover:bg-white/[0.08] hover:text-white cursor-pointer transition"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: selectedColor }}
                  />
                  Custom Color
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/[0.08]">
            <div className="text-xs text-white/40 leading-relaxed max-w-md">
              Posts tagged with this category will inherit its visual badge color across calendars, analytics, and publishing queues.
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition duration-200 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>
        </form>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-6 py-4 text-xs font-medium ${
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
            <X size={15} />
          </button>
        </div>
      )}

      {/* Category List */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#101020]/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/40 space-y-6">
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Active Categories</h3>
              <p className="text-xs text-white/50 mt-0.5">Manage and edit your workspace tags.</p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs font-medium text-white/60">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </span>
        </div>

        <div className="grid gap-4">
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
                className="flex flex-col gap-4 rounded-2xl border border-violet-500/40 bg-violet-500/[0.08] p-6 sm:flex-row sm:items-center shadow-lg"
              >
                <input type="hidden" name="category_id" value={category.id} />
                <input
                  name="name"
                  defaultValue={category.name}
                  maxLength={80}
                  className="h-12 flex-1 rounded-2xl border border-white/10 bg-[#16162e] px-4 text-sm text-white outline-none focus:border-violet-500"
                  required
                />
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <label
                      htmlFor={`edit-color-${category.id}`}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#16162e] cursor-pointer hover:border-white/20 transition"
                      title="Pick new color"
                    >
                      <span
                        className="h-6 w-6 rounded-full border border-white/20 shadow-sm"
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
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-md"
                  >
                    <Check size={15} /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-white/60 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <X size={15} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div
                key={category.id}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#14142a]/70 p-5 sm:p-6 transition-all duration-200 hover:border-violet-500/35 hover:bg-[#181834] shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${category.color}18`,
                      border: `1px solid ${category.color}35`,
                    }}
                  >
                    <span
                      className="h-4.5 w-4.5 rounded-full shadow-sm"
                      style={{
                        backgroundColor: category.color,
                        boxShadow: `0 0 12px ${category.color}`,
                      }}
                    />
                  </div>
                  <div>
                    <div className="truncate text-base font-semibold text-white">{category.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-white/40 bg-white/[0.03] px-2.5 py-0.5 rounded-md border border-white/[0.06]">
                        {category.color}
                      </span>
                      <span className="text-xs text-white/40 hidden sm:inline">Workspace Tag</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    aria-label={`Edit ${category.name}`}
                    onClick={() => startEditingCategory(category)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-white/80 hover:bg-white/[0.08] hover:text-white transition"
                    title="Edit category"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
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
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
                      title="Delete category"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </form>
                </div>
              </div>
            )
          )}

          {categories.length === 0 && (
            <div className="py-16 text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white/30">
                <Tag size={24} />
              </div>
              <p className="mt-4 text-base font-semibold text-white/70">No categories created yet</p>
              <p className="mt-1.5 text-xs text-white/40 max-w-sm mx-auto">
                Use the form above to add your first post classification tag.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
