import type { PostStatus } from "@/types/database";

const styles: Record<PostStatus, string> = {
  DRAFT: "border border-white/10 bg-white/[0.04] text-white/70",
  SCHEDULED: "border border-amber-500/20 bg-amber-500/10 text-amber-300",
  PUBLISHED: "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  FAILED: "border border-rose-500/20 bg-rose-500/10 text-rose-300",
};

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${styles[status]}`}>
      {status[0] + status.slice(1).toLowerCase()}
    </span>
  );
}

