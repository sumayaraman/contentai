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
    <div className="space-y-8">
      {/* Create New Category Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0f0f1a]/90 p-7 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3 pb-5 border-b border-white/[0.08]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <FolderPlus size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Create New Category</h2>
            <p className="text-xs text-white/50">Add a tag name and custom color theme to classify your posts.</p>
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
          className="mt-6 space-y-6"
        >
          <div>
            <label htmlFor="cat-name" className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-white/70">
              Category Name
            </label>
            <input
              id="cat-name"
              name="name"
              maxLength={80}
              placeholder="e.g. Product Updates, Behind the Scenes, Tips & Guides"
              className="h-12 w-full rounded-xl border border-white/10 bg-[#141428] px-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              required
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                <Palette size={14} className="text-violet-400" /> Color Accent
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">{activePreset ? activePreset.name : "Custom"}</span>
                <span className="font-mono text-xs text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                  {selectedColor}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {PRESET_COLORS.map((preset) => {
                const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setSelectedColor(preset.hex)}
                    title={preset.name}
                    aria-label={`Select color ${preset.name}`}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 ${
                      isSelected
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f0f1a] scale-110 shadow-lg"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: preset.hex, boxShadow: isSelected ? `0 0 16px ${preset.hex}88` : undefined }}
                  >
                    {isSelected && <Check size={16} className="text-white drop-shadow-md stroke-[3]" />}
                  </button>
                );
              })}

              {/* Custom Color Input */}
              <div className="relative flex items-center">
                <label
                  htmlFor="custom-color-picker"
                  className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 text-xs font-medium text-white/80 hover:bg-white/[0.08] hover:text-white cursor-pointer transition"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: selectedColor }}
                  />
                  Custom Pick
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

          <div className="flex items-center justify-between pt-5 border-t border-white/[0.08]">
            <div className="text-xs text-white/40">
              Posts categorized with this tag will inherit this visual theme.
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>
        </form>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl border px-5 py-3.5 text-xs font-medium ${
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
      <div className="rounded-2xl border border-white/10 bg-[#0f0f1a]/90 p-7 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Tag size={16} className="text-violet-400" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Active Categories
            </h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60">
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </span>
        </div>

        <div className="grid gap-3.5">
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
                className="flex flex-col gap-3 rounded-2xl border border-violet-500/40 bg-violet-500/[0.06] p-5 sm:flex-row sm:items-center shadow-lg"
              >
                <input type="hidden" name="category_id" value={category.id} />
                <input
                  name="name"
                  defaultValue={category.name}
                  maxLength={80}
                  className="h-11 flex-1 rounded-xl border border-white/10 bg-[#16162a] px-4 text-sm text-white outline-none focus:border-violet-500"
                  required
                />
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <label
                      htmlFor={`edit-color-${category.id}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#16162a] cursor-pointer hover:border-white/20 transition"
                      title="Pick new color"
                    >
                      <span
                        className="h-5 w-5 rounded-full border border-white/20 shadow-sm"
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
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-5 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-md"
                  >
                    <Check size={15} /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-white/60 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <X size={15} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div
                key={category.id}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#121226]/90 p-4 sm:p-5 transition-all duration-200 hover:border-violet-500/30 hover:bg-[#15152c] shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${category.color}1a`,
                      border: `1px solid ${category.color}40`,
                    }}
                  >
                    <span
                      className="h-4 w-4 rounded-full shadow-sm"
                      style={{
                        backgroundColor: category.color,
                        boxShadow: `0 0 10px ${category.color}`,
                      }}
                    />
                  </div>
                  <div>
                    <div className="truncate text-sm font-semibold text-white">{category.name}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-white/40 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
                        {category.color}
                      </span>
                      <span className="text-[11px] text-white/40">Workspace category</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Edit ${category.name}`}
                    onClick={() => startEditingCategory(category)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition"
                    title="Edit category"
                  >
                    <Pencil size={13} />
                    <span className="hidden sm:inline">Edit</span>
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
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition"
                      title="Delete category"
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </form>
                </div>
              </div>
            )
          )}

          {categories.length === 0 && (
            <div className="py-14 text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white/30">
                <Tag size={22} />
              </div>
              <p className="mt-3 text-sm font-semibold text-white/70">No categories created yet</p>
              <p className="mt-1 text-xs text-white/40 max-w-sm mx-auto">
                Use the form above to add your first post classification tag.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
