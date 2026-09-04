"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { createCategory, deleteCategory, updateCategory } from "@/lib/content/actions";
import type { Category } from "@/types/database";

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return <div className="space-y-5">
    <form action={async (formData: FormData) => { startTransition(async () => { const result = await createCategory(formData); if (!result.ok) setMessage(result.error || "Could not create category."); else setMessage("Category created."); }); }} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end">
      <div className="flex-1"><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">New category</label><input name="name" maxLength={80} placeholder="e.g. Tips & Tricks" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400" required /></div>
      <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Color</label><input name="color" type="color" defaultValue="#2563eb" className="h-10 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" /></div>
      <button disabled={isPending} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16} /> Add</button>
    </form>
    {message && <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">{message}</div>}
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {categories.map((category) => editing === category.id ? <form key={category.id} action={async (formData: FormData) => { startTransition(async () => { const result = await updateCategory(formData); if (!result.ok) setMessage(result.error || "Could not update category."); else { setMessage("Category updated."); setEditing(null); } }); }} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><input type="hidden" name="category_id" value={category.id} /><input name="name" defaultValue={category.name} maxLength={80} className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" required /><input name="color" type="color" defaultValue={category.color} className="h-10 w-16 rounded-lg border border-slate-200 p-1" /><button disabled={isPending} className="rounded-lg bg-slate-950 p-2 text-white"><Check size={16} /></button><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 p-2 text-slate-600"><X size={16} /></button></form> : <div key={category.id} className="flex items-center justify-between gap-4 p-4"><div className="flex min-w-0 items-center gap-3"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} /><span className="truncate text-sm font-semibold text-slate-800">{category.name}</span></div><div className="flex items-center gap-1"><button aria-label={`Edit ${category.name}`} onClick={() => setEditing(category.id)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button><form action={async (formData: FormData) => { if (!window.confirm(`Delete ${category.name}? Posts using it will become uncategorized.`)) return; startTransition(async () => { const result = await deleteCategory(formData); if (!result.ok) setMessage(result.error || "Could not delete category."); else setMessage("Category deleted."); }); }}><input type="hidden" name="category_id" value={category.id} /><button aria-label={`Delete ${category.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></form></div></div>)}
      {categories.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No categories yet. Create your first category above.</div>}
    </div>
  </div>;
}
