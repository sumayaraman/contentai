"use client";

import { useState, useTransition } from "react";
import { Check, FolderPlus, Loader2, Palette, Pencil, Plus, Search, Tag, Trash2, X } from "lucide-react";
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
  const [isCreating, setIsCreating] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("#8b5cf6");

  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editColor, setEditColor] = useState<string>("#8b5cf6");

  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function startEditingCategory(cat: Category) {
    setEditing(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color || "#8b5cf6");
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Feedback Toast */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium backdrop-blur-xl transition-all ${
            message.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-white/40 hover:text-white transition cursor-pointer"
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Expandable Category Creator Panel */}
      {isCreating && (
        <div className="rounded-2xl border border-white/10 bg-[#101022]/95 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-black/40 space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/25">
                <FolderPlus size={15} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Create New Category</h3>
                <p className="text-[11px] text-white/40">Define a topic tag and choose an accent color</p>
              </div>
            </div>

            {/* Live Badge Preview */}
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-1.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-white/40">
                Preview
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all shadow-sm"
                style={{
                  backgroundColor: `${selectedColor}18`,
                  border: `1px solid ${selectedColor}40`,
                  color: "#ffffff",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: selectedColor,
                    boxShadow: `0 0 6px ${selectedColor}`,
                  }}
                />
                <span className="max-w-[130px] truncate">
                  {newCatName.trim() || "Preview Tag"}
                </span>
              </span>
            </div>
          </div>

          <form
            action={async (formData: FormData) => {
              formData.set("color", selectedColor);
              formData.set("name", newCatName);
              startTransition(async () => {
                const result = await createCategory(formData);
                if (!result.ok) {
                  setMessage({ type: "error", text: result.error || "Could not create category." });
                } else {
                  setMessage({ type: "success", text: `Category "${newCatName.trim()}" created successfully.` });
                  setNewCatName("");
                  setIsCreating(false);
                }
              });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              {/* Category Name */}
              <div className="sm:col-span-6 space-y-1.5">
                <label
                  htmlFor="new-category-name"
                  className="block text-xs font-semibold text-white/70"
                >
                  Category Name
                </label>
                <input
                  id="new-category-name"
                  name="name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Product Updates, Behind the Scenes"
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#16162a] px-3.5 text-xs sm:text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  required
                  autoFocus
                />
              </div>

              {/* Color Swatches */}
              <div className="sm:col-span-6 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/70">
                    Accent Color
                  </label>
                  <span className="font-mono text-[11px] text-white/40">
                    {selectedColor.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {PRESET_COLORS.map((preset) => {
                      const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setSelectedColor(preset.hex)}
                          title={preset.name}
                          aria-label={`Select ${preset.name} color`}
                          className={`flex h-6 w-6 items-center justify-center rounded-full transition-all cursor-pointer ${
                            isSelected
                              ? "ring-2 ring-white ring-offset-2 ring-offset-[#101022] scale-110"
                              : "opacity-75 hover:opacity-100 hover:scale-105"
                          }`}
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && <Check size={11} className="text-white drop-shadow stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom color trigger */}
                  <div className="relative pl-1 border-l border-white/10">
                    <label
                      htmlFor="custom-color-input"
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] cursor-pointer hover:border-white/40 transition"
                      title="Custom color"
                    >
                      <Palette size={11} className="text-white/60" />
                    </label>
                    <input
                      id="custom-color-input"
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="sr-only"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewCatName("");
                }}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs font-medium text-white/70 hover:bg-white/[0.06] hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !newCatName.trim()}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-40 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Check size={13} />
                )}
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Unified Categories Data Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/80 backdrop-blur-xl shadow-xl shadow-black/30 overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/[0.06] bg-white/[0.015]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20">
              <Tag size={14} />
            </div>
            <h2 className="text-sm font-semibold text-white">Active Categories</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-white/60">
              {filteredCategories.length} {filteredCategories.length === 1 ? "tag" : "tags"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {categories.length > 3 && (
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter categories..."
                  className="h-8 w-36 sm:w-44 rounded-lg border border-white/10 bg-[#16162a] pl-7 pr-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-violet-500 transition"
                />
              </div>
            )}
            {!isCreating && (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-sm cursor-pointer"
              >
                <Plus size={13} />
                <span>New Category</span>
              </button>
            )}
          </div>
        </div>

        {/* Column Headers */}
        {categories.length > 0 && (
          <div className="grid grid-cols-12 px-5 py-2.5 border-b border-white/[0.04] bg-white/[0.01] text-[10.5px] font-semibold text-white/40 uppercase tracking-wider">
            <div className="col-span-6 sm:col-span-5">Category Tag</div>
            <div className="col-span-3 sm:col-span-3">Accent Color</div>
            <div className="col-span-3 sm:col-span-2 hidden sm:block">Scope</div>
            <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
          </div>
        )}

        {/* Categories List */}
        <div className="divide-y divide-white/[0.04]">
          {filteredCategories.map((category) =>
            editing === category.id ? (
              /* Inline Edit Mode */
              <form
                key={category.id}
                action={async (formData: FormData) => {
                  formData.set("color", editColor);
                  formData.set("name", editName);
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
                className="grid grid-cols-12 items-center gap-3 px-5 py-3 bg-violet-500/[0.06] border-l-2 border-violet-500"
              >
                <input type="hidden" name="category_id" value={category.id} />
                <div className="col-span-6 sm:col-span-5">
                  <input
                    name="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={80}
                    className="h-8 w-full rounded-lg border border-white/20 bg-[#16162a] px-2.5 text-xs text-white outline-none focus:border-violet-500 transition"
                    required
                    autoFocus
                  />
                </div>
                <div className="col-span-3 sm:col-span-3 flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    {PRESET_COLORS.slice(0, 5).map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setEditColor(preset.hex)}
                        title={preset.name}
                        className={`h-4 w-4 rounded-full transition-all cursor-pointer ${
                          editColor.toLowerCase() === preset.hex.toLowerCase()
                            ? "ring-1.5 ring-white scale-110"
                            : "opacity-60 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: preset.hex }}
                      />
                    ))}
                  </div>
                  <label
                    htmlFor={`edit-color-${category.id}`}
                    className="h-5 w-5 rounded-full border border-white/20 flex items-center justify-center cursor-pointer ml-1"
                    title="Choose color"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
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
                  <input type="hidden" name="color" value={editColor} />
                </div>
                <div className="col-span-3 sm:col-span-4 flex items-center justify-end gap-1.5">
                  <button
                    disabled={isPending}
                    type="submit"
                    className="inline-flex h-7 items-center gap-1 rounded-lg bg-violet-600 px-2.5 text-xs font-semibold text-white hover:bg-violet-500 transition cursor-pointer"
                  >
                    <Check size={12} />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="inline-flex h-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-2 text-xs text-white/60 hover:bg-white/[0.08] hover:text-white transition cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </form>
            ) : (
              /* Standard Table Row */
              <div
                key={category.id}
                className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Badge Column */}
                <div className="col-span-6 sm:col-span-5 flex items-center min-w-0 pr-2">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold max-w-full truncate shadow-sm transition-transform group-hover:scale-[1.01]"
                    style={{
                      backgroundColor: `${category.color}15`,
                      border: `1px solid ${category.color}35`,
                      color: "#ffffff",
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: category.color,
                        boxShadow: `0 0 6px ${category.color}`,
                      }}
                    />
                    <span className="truncate">{category.name}</span>
                  </span>
                </div>

                {/* Color Column */}
                <div className="col-span-3 sm:col-span-3 flex items-center gap-2 font-mono text-xs text-white/50">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 border border-white/20"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.color?.toUpperCase()}</span>
                </div>

                {/* Scope Column */}
                <div className="col-span-3 sm:col-span-2 hidden sm:flex items-center gap-1.5 text-xs text-white/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                  <span>Workspace Tag</span>
                </div>

                {/* Actions Column */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => startEditingCategory(category)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                    title="Edit category"
                  >
                    <Pencil size={13} />
                  </button>
                  <form
                    action={async (formData: FormData) => {
                      if (!window.confirm(`Delete category "${category.name}"? Posts using this tag will become uncategorized.`)) return;
                      startTransition(async () => {
                        const result = await deleteCategory(formData);
                        if (!result.ok) setMessage({ type: "error", text: result.error || "Could not delete category." });
                        else setMessage({ type: "success", text: "Category deleted." });
                      });
                    }}
                  >
                    <input type="hidden" name="category_id" value={category.id} />
                    <button
                      type="submit"
                      aria-label={`Delete ${category.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
            )
          )}

          {/* Empty State */}
          {categories.length === 0 && (
            <div className="py-16 text-center px-4">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-3 shadow-inner">
                <Tag size={20} />
              </div>
              <h3 className="text-sm font-semibold text-white">No categories created yet</h3>
              <p className="mt-1 text-xs text-white/40 max-w-sm mx-auto leading-relaxed">
                Color-coded categories help you group posts by campaign, content pillar, or department.
              </p>
              {!isCreating && (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/20 hover:bg-violet-500 transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create First Category</span>
                </button>
              )}
            </div>
          )}

          {/* No Search Results */}
          {categories.length > 0 && filteredCategories.length === 0 && (
            <div className="py-12 text-center text-xs text-white/40">
              No categories match &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
