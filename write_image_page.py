import os
os.makedirs("app/(dashboard)/image-studio", exist_ok=True)

page = '''import { ImageGenerator } from "@/components/image/image-generator";
import { createClient } from "@/lib/supabase/server";

export default async function ImageStudioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let posts: { id: string; title: string; platform: string }[] = [];
  if (user) {
    const { data } = await supabase
      .from("posts")
      .select("id, title, platform")
      .order("created_at", { ascending: false })
      .limit(20);
    posts = data ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Image & Video Studio</h1>
        <p className="text-slate-500 mt-1">Generate images and videos for your social media content.</p>
      </div>
      <ImageGenerator posts={posts} />
    </div>
  );
}
'''

with open("app/(dashboard)/image-studio/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
print("Page created!")