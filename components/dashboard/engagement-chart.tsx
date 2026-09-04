export function EngagementChart() {
  const points = "0,108 42,96 84,101 126,75 168,83 210,55 252,64 294,38 336,48 378,23 420,31 462,12";
  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex h-full flex-col">
        <div className="flex justify-between text-xs text-slate-400"><span>Engagement</span><span>Last 30 days</span></div>
        <div className="relative mt-3 min-h-0 flex-1">
          <div className="absolute inset-0 flex flex-col justify-between">
            {["", "", "", ""].map((_, i) => <div key={i} className="border-t border-dashed border-slate-200" />)}
          </div>
          <svg viewBox="0 0 462 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke" className="text-blue-600" />
          </svg>
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>Aug 3</span><span>Aug 10</span><span>Aug 17</span><span>Aug 24</span><span>Sep 1</span></div>
      </div>
    </div>
  );
}
