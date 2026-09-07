import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/security/paths";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Media not found." }, { status: 404 });
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data: media, error } = await supabase.from("media").select("storage_path, mime_type").eq("id", id).maybeSingle();
  if (error || !media?.storage_path) return NextResponse.json({ error: "Media not found." }, { status: 404 });
  const { data, error: downloadError } = await supabase.storage.from("media").download(media.storage_path);
  if (downloadError || !data) return NextResponse.json({ error: "Media is temporarily unavailable." }, { status: 404 });
  return new NextResponse(data, { status: 200, headers: { "Content-Type": media.mime_type, "Cache-Control": "private, max-age=3600" } });
}
