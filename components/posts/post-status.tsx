import { CheckCircle2, Clock3, FileText, TriangleAlert } from "lucide-react";
import type { PostStatus } from "@/types/database";

const config: Record<PostStatus, { label: string; className: string; icon: typeof FileText }> = {
  DRAFT: { label: "Draft", className: "border border-white/10 bg-white/[0.04] text-white/70", icon: FileText },
  SCHEDULED: { label: "Scheduled", className: "border border-amber-500/20 bg-amber-500/10 text-amber-300", icon: Clock3 },
  PUBLISHED: { label: "Published", className: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300", icon: CheckCircle2 },
  FAILED: { label: "Failed", className: "border border-rose-500/20 bg-rose-500/10 text-rose-300", icon: TriangleAlert },
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const item = config[status];
  const Icon = item.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${item.className}`}>
      <Icon size={12} />
      {item.label}
    </span>
  );
}

