export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true">
      <div className="h-8 w-64 animate-pulse rounded-xl bg-white/[0.06]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.02]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="h-80 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.02]" />
        <div className="h-80 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.02]" />
      </div>
    </div>
  );
}

