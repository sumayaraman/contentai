import { Image as ImageIcon } from "lucide-react";
import { getActiveWorkspace } from "@/lib/content/workspace";
import { MediaLibrary } from "@/components/media/media-library";
import type { Media } from "@/types/database";

export default async function MediaLibraryPage() {
  const { supabase, workspaceId } = await getActiveWorkspace();
  const { data, error } = await supabase.from("media").select("id, workspace_id, uploaded_by, file_name, mime_type, file_size, storage_path, url, source, generation_prompt, generation_provider, generation_model, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return <div className="mx-auto max-w-7xl space-y-6"><div className="flex items-end gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><ImageIcon size={19} /></div><div><p className="text-sm font-medium text-blue-600">Content management</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Media Library</h1><p className="mt-1 text-sm text-slate-500">Store workspace images and attach them to your posts.</p></div></div><MediaLibrary media={(data ?? []) as Media[]} /></div>;
}
