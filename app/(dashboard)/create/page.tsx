import Link from "next/link";
import {
  Sparkles,
  PenSquare,
  ImageIcon,
  WandSparkles,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  FileEdit,
} from "lucide-react";

export default function CreatePage() {
  const workflows = [
    {
      badge: "Fast Copy & Hooks",
      badgeColor: "border-violet-500/30 bg-violet-500/10 text-violet-300",
      icon: Sparkles,
      iconBg: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
      title: "Social Content",
      headline: "Turn your idea into a ready-to-post post",
      description:
        "Draft compelling social copy with AI-crafted hooks, engaging body captions, calls to action, and relevant hashtags tailored to each channel.",
      bullets: [
        "Instagram, LinkedIn, Facebook, and X formatting",
        "Instant content engagement score & suggestions",
        "1-click export to post editor or drafts",
      ],
      ctaText: "Create Content",
      ctaLink: "/ai-studio",
      primary: true,
    },
    {
      badge: "Single Visual Asset",
      badgeColor: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
      icon: ImageIcon,
      iconBg: "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30",
      title: "Image & Video",
      headline: "Create one custom visual for your next post",
      description:
        "Synthesize high-fidelity promotional imagery or preview video clips from textual prompts with custom aspect ratios.",
      bullets: [
        "Photorealistic 1:1, 16:9, and 9:16 aspect ratios",
        "Free live image generation powered by Flux",
        "Save to media library or attach to any post",
      ],
      ctaText: "Create Visual",
      ctaLink: "/image-studio",
      primary: false,
    },
    {
      badge: "Full Month Plan",
      badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      icon: WandSparkles,
      iconBg: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      title: "30-Day Workshop",
      headline: "Generate a complete month of branded content",
      description:
        "Build a month-long visual strategy complete with your brand identity, logo watermarks on every graphic, and batch calendar scheduling.",
      bullets: [
        "Automated multi-day roadmap with daily hooks",
        "Custom logo watermark on generated images",
        "1-click batch dispatch directly to your calendar",
      ],
      ctaText: "Open Workshop",
      ctaLink: "/workspace",
      primary: false,
    },
  ];

  return (
    <div className="page animate-fade-up max-w-6xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            <Sparkles size={13} /> Create Studio
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            What would you like to create?
          </h1>
          <p className="mt-1 text-sm text-white/50 max-w-2xl">
            Choose the creation workflow that matches your objective. ContentAI helps you craft individual posts, generate unique artwork, or plan your entire month.
          </p>
        </div>
        <Link
          href="/posts/new"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition self-start sm:self-auto border border-white/10 rounded-xl px-3.5 py-2 hover:border-white/20"
        >
          <FileEdit size={14} />
          <span>Write Manual Post</span>
        </Link>
      </div>

      {/* 3 Main Workflow Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {workflows.map((wf, i) => {
          const Icon = wf.icon;
          return (
            <div
              key={i}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
                wf.primary
                  ? "border-violet-500/30 bg-gradient-to-b from-[#13112a] to-[#0c0c16] shadow-xl shadow-violet-600/10 hover:border-violet-500/50"
                  : "border-white/[0.08] bg-[#0c0c16]/90 backdrop-blur-xl hover:border-white/20 shadow-lg"
              }`}
            >
              <div className="space-y-5">
                {/* Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${wf.iconBg}`}>
                    <Icon size={22} />
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide ${wf.badgeColor}`}>
                    {wf.badge}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{wf.title}</h2>
                  <p className="text-xs font-semibold text-violet-300/80 mt-0.5">{wf.headline}</p>
                  <p className="text-xs text-white/50 mt-2.5 leading-relaxed">{wf.description}</p>
                </div>

                {/* Bullets */}
                <div className="space-y-2 border-t border-white/[0.06] pt-4">
                  {wf.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-xs text-white/70">
                      <CheckCircle2 size={14} className="text-violet-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <Link
                  href={wf.ctaLink}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition ${
                    wf.primary
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500"
                      : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <span>{wf.ctaText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Guidance Footer Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c16]/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Not sure where to begin?</h3>
            <p className="text-xs text-white/50 mt-0.5">
              Ask our AI Assistant for inspiration or let it recommend the best workflow for your industry.
            </p>
          </div>
        </div>
        <Link
          href="/ai-assistant"
          className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition shrink-0"
        >
          <span>Ask Assistant</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
