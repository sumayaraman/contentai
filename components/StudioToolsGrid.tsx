import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const studioTools = [
  {
    title: "Image Generator",
    category: "Visual Generation",
    desc: "Generate high-resolution photorealistic imagery and artwork from natural language prompts.",
    img: "/studio-cards/image-generator.png",
    href: "/image-studio",
    badge: "SDXL & Flux",
  },
  {
    title: "AI Content Studio",
    category: "Copywriting & Scripts",
    desc: "Draft viral hooks, LinkedIn carousels, blog posts, and converting ad copy in seconds.",
    img: "/studio-cards/ai-content-studio.png",
    href: "/ai-studio",
    badge: "LLM Powered",
  },
  {
    title: "Video & Reel Studio",
    category: "Motion & Video",
    desc: "Transform ideas into engaging short-form reels, caption overlays, and video storylines.",
    img: "/studio-cards/video-reel-studio.png",
    href: "/image-studio?tab=video",
    badge: "Cinematic AI",
  },
  {
    title: "Campaign Generator",
    category: "Marketing Strategy",
    desc: "Generate complete multi-week editorial schedules, campaign themes, and omni-channel tactics.",
    img: "/studio-cards/campaign-generator.png",
    href: "/campaigns",
    badge: "Multi-Channel",
  },
  {
    title: "Content Calendar",
    category: "Planning & Cadence",
    desc: "Organize, schedule, and automate your publication calendar across multiple workspace channels.",
    img: "/studio-cards/content-calendar.png",
    href: "/calendar",
    badge: "Smart Sync",
  },
  {
    title: "Social Publishing Hub",
    category: "Distribution",
    desc: "Direct multi-account scheduling and dispatch to LinkedIn, Twitter, Instagram, and Facebook.",
    img: "/studio-cards/social-publishing.png",
    href: "/publishing",
    badge: "Live Dispatch",
  },
  {
    title: "Content Intelligence",
    category: "Analytics & Insights",
    desc: "Measure reach, engagement velocity, and content resonance with actionable AI insights.",
    img: "/studio-cards/content-intelligence.png",
    href: "/analytics",
    badge: "Real-time",
  },
  {
    title: "Media & Asset Cloud",
    category: "Asset Management",
    desc: "Cloud storage for brand logos, artwork, videos, and generated assets with instant tagging.",
    img: "/studio-cards/media-asset-cloud.png",
    href: "/media-library",
    badge: "Cloud Library",
  },
];

export default function StudioToolsGrid() {
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-violet-400">
            Creative Suite
          </span>
          <h2 className="text-[24px] md:text-[28px] font-semibold text-white tracking-tight mt-1">
            Creative Tools Studio
          </h2>
          <p className="text-[14px] text-white/55 mt-1 max-w-xl">
            Access 8 specialized engines to ideate, produce, schedule, and distribute world-class content.
          </p>
        </div>
        <span className="text-[12px] text-white/40 font-medium shrink-0">
          8 Production Engines
        </span>
      </div>

      {/* 3-Column Responsive Grid on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studioTools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group relative bg-[#0E0E17] hover:bg-[#131320] border border-white/[0.08] hover:border-violet-500/30 rounded-[18px] overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col no-underline text-inherit cursor-pointer"
          >
            {/* Visual Preview */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#07070C] m-3 mb-0 rounded-[12px]">
              <img
                src={tool.img}
                alt={tool.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10.5px] font-medium text-white/80">
                {tool.badge}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-violet-400">
                    {tool.category}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/[0.04] group-hover:bg-violet-500/20 flex items-center justify-center text-white/40 group-hover:text-violet-300 transition-colors">
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                <h3 className="text-[16px] font-semibold text-white tracking-tight group-hover:text-violet-200 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-[13px] text-white/55 leading-relaxed mt-1.5 line-clamp-2">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[12px] text-white/40 group-hover:text-white/70 transition-colors font-medium">
                <span>Launch Engine</span>
                <span className="text-violet-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
