import { CheckCircle2, Clock3, FileText, TriangleAlert } from "lucide-react";
import type { PostStatus } from "@/types/database";

const config: Record<PostStatus, { label: string; className: string; icon: typeof FileText }> = {
  DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700", icon: FileText },
  SCHEDULED: { label: "Scheduled", className: "bg-amber-50 text-amber-700", icon: Clock3 },
  PUBLISHED: { label: "Published", className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  FAILED: { label: "Failed", className: "bg-red-50 text-red-700", icon: TriangleAlert },
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const item = config[status];
  const Icon = item.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${item.className}`}><Icon size={13} />{item.label}</span>;
}
