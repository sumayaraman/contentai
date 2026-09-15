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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Feedback Toast */}
      {message && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            background: message.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
            borderRadius: "var(--r-md)",
            color: message.type === "success" ? "#4ade80" : "#f87171",
            fontSize: 13,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {message.type === "success" ? <Check size={16} /> : <X size={16} />}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Expandable Category Creator Panel */}
      {isCreating && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 16,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "var(--r-md)",
                  background: "var(--accent-soft)",
                  border: "1px solid var(--border-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a89dff",
                  flexShrink: 0,
                }}
              >
                <FolderPlus size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Create New Category
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  Define a topic tag and choose an accent color
                </p>
              </div>
            </div>

            {/* Live Badge Preview */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                padding: "6px 14px",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>
                Preview:
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 99,
                  padding: "3px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: `${selectedColor}18`,
                  border: `1px solid ${selectedColor}40`,
                  color: "#ffffff",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: selectedColor,
                    boxShadow: `0 0 6px ${selectedColor}`,
                  }}
                />
                <span style={{ maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {/* Category Name */}
              <div>
                <div className="campaign-field-label">
                  <span>Category Name</span>
                </div>
                <input
                  id="new-category-name"
                  name="name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Product Updates, Behind the Scenes"
                  className="campaign-input"
                  style={{ height: 40 }}
                  required
                  autoFocus
                />
              </div>

              {/* Color Swatches */}
              <div>
                <div className="campaign-field-label">
                  <span>Accent Color</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>
                    {selectedColor.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, height: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {PRESET_COLORS.map((preset) => {
                      const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setSelectedColor(preset.hex)}
                          title={preset.name}
                          aria-label={`Select ${preset.name} color`}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            backgroundColor: preset.hex,
                            border: isSelected ? "2px solid #ffffff" : "2px solid transparent",
                            boxShadow: isSelected ? `0 0 8px ${preset.hex}` : "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom color picker */}
                  <label
                    htmlFor="custom-color-input"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "1px dashed var(--border)",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      marginLeft: 4,
                    }}
                    title="Custom color"
                  >
                    <Palette size={12} style={{ color: "var(--text-secondary)" }} />
                  </label>
                  <input
                    id="custom-color-input"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewCatName("");
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !newCatName.trim()}
                className="btn btn-primary btn-sm"
                style={{ gap: 6 }}
              >
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Unified Categories Data Table */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Table Toolbar Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--r-md)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
                flexShrink: 0,
              }}
            >
              <Tag size={16} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Active Categories
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 99,
                    padding: "2px 8px",
                  }}
                >
                  {filteredCategories.length} {filteredCategories.length === 1 ? "tag" : "tags"}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Organize content by campaign pillars and topics
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {categories.length > 3 && (
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter categories..."
                  className="campaign-input"
                  style={{ height: 38, paddingLeft: 30, width: 190 }}
                />
              </div>
            )}
            {!isCreating && (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: "var(--r-md)",
                  background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(109,92,255,0.3)",
                }}
              >
                <Plus size={14} />
                <span>New Category</span>
              </button>
            )}
          </div>
        </div>

        {/* Column Headers */}
        {categories.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(200px, 2fr) minmax(140px, 1.5fr) minmax(130px, 1fr) 100px",
              padding: "12px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "rgba(255,255,255,0.015)",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-muted)",
            }}
          >
            <div>Category Tag</div>
            <div>Accent Color</div>
            <div>Scope</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>
        )}

        {/* Categories List */}
        <div style={{ display: "flex", flexDirection: "column" }}>
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
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(200px, 2fr) minmax(140px, 1.5fr) minmax(130px, 1fr) 100px",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 24px",
                  background: "rgba(109,92,255,0.06)",
                  borderLeft: "3px solid var(--accent)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <input type="hidden" name="category_id" value={category.id} />
                <div>
                  <input
                    name="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={80}
                    className="campaign-input"
                    style={{ height: 36 }}
                    required
                    autoFocus
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {PRESET_COLORS.slice(0, 5).map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setEditColor(preset.hex)}
                        title={preset.name}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          backgroundColor: preset.hex,
                          border: editColor.toLowerCase() === preset.hex.toLowerCase() ? "2px solid #ffffff" : "2px solid transparent",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    style={{ width: 22, height: 22, border: "none", background: "transparent", cursor: "pointer" }}
                  />
                  <input type="hidden" name="color" value={editColor} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Editing…</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  <button
                    disabled={isPending}
                    type="submit"
                    className="btn btn-primary btn-sm"
                    style={{ height: 32, padding: "0 10px", fontSize: 12 }}
                  >
                    <Check size={12} /> Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="btn btn-ghost btn-sm"
                    style={{ height: 32, padding: "0 8px" }}
                  >
                    <X size={12} />
                  </button>
                </div>
              </form>
            ) : (
              /* Standard Table Row */
              <div
                key={category.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(200px, 2fr) minmax(140px, 1.5fr) minmax(130px, 1fr) 100px",
                  alignItems: "center",
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background 0.15s ease",
                }}
                className="hover:bg-white/[0.02]"
              >
                {/* Badge Column */}
                <div style={{ display: "flex", alignItems: "center", minWidth: 0, paddingRight: 8 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 99,
                      padding: "4px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: `${category.color}15`,
                      border: `1px solid ${category.color}35`,
                      color: "#ffffff",
                      maxWidth: "100%",
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        flexShrink: 0,
                        backgroundColor: category.color,
                        boxShadow: `0 0 6px ${category.color}`,
                      }}
                    />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {category.name}
                    </span>
                  </span>
                </div>

                {/* Color Column */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: 12, color: "var(--text-secondary)" }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      flexShrink: 0,
                      backgroundColor: category.color,
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  />
                  <span>{category.color?.toUpperCase()}</span>
                </div>

                {/* Scope Column */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#34d399" }} />
                  <span>Workspace Tag</span>
                </div>

                {/* Actions Column */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  <button
                    type="button"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => startEditingCategory(category)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "var(--r-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    className="hover:text-white hover:bg-white/[0.08]"
                    title="Edit category"
                  >
                    <Pencil size={14} />
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
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--r-sm)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-muted)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      className="hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              </div>
            )
          )}

          {/* Empty State */}
          {categories.length === 0 && (
            <div style={{ padding: "64px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--r-md)",
                  background: "var(--accent-soft)",
                  border: "1px solid var(--border-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a89dff",
                  marginBottom: 16,
                }}
              >
                <Tag size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                No categories created yet
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", maxWidth: 380, margin: "8px 0 20px", lineHeight: 1.5 }}>
                Color-coded categories help you group posts by campaign, content pillar, or department.
              </p>
              {!isCreating && (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: "var(--r-md)",
                    background: "linear-gradient(135deg, #6d5cff 0%, #a855f7 100%)",
                    padding: "10px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(109,92,255,0.3)",
                  }}
                >
                  <Plus size={14} />
                  <span>Create First Category</span>
                </button>
              )}
            </div>
          )}

          {/* No Search Results */}
          {categories.length > 0 && filteredCategories.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
              No categories match &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
