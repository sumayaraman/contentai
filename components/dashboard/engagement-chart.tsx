export function EngagementChart() {
  const points = "0,108 42,96 84,101 126,75 168,83 210,55 252,64 294,38 336,48 378,23 420,31 462,12";
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-4 backdrop-blur-xl shadow-sm">
      <div className="flex h-full flex-col">
        <div className="flex justify-between text-xs text-white/50">
          <span className="font-medium text-white/80">Engagement Rate</span>
          <span>Last 30 days</span>
        </div>
        <div className="relative mt-3 min-h-0 flex-1">
          <div className="absolute inset-0 flex flex-col justify-between">
            {["", "", "", ""].map((_, i) => (
              <div key={i} className="border-t border-dashed border-white/[0.06]" />
            ))}
          </div>
          <svg viewBox="0 0 462 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <polyline
              points={points}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-white/40">
          <span>Aug 3</span>
          <span>Aug 10</span>
          <span>Aug 17</span>
          <span>Aug 24</span>
          <span>Sep 1</span>
        </div>
      </div>
    </div>
  );
}

