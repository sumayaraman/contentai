"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  Video,
  FileText,
  Megaphone,
  Clock,
  ExternalLink,
} from "lucide-react";

const quickModes = [
  { id: "image", label: "Image", icon: ImageIcon, placeholder: "Describe an image to generate with AI...", route: "/image-studio" },
  { id: "video", label: "Video", icon: Video, placeholder: "Describe a video scene or reel to create...", route: "/image-studio?tab=video" },
  { id: "copy", label: "Copy", icon: FileText, placeholder: "Describe a topic or hook for AI copy & captions...", route: "/ai-studio" },
  { id: "campaign", label: "Campaign", icon: Megaphone, placeholder: "Describe your product or launch goal for a campaign...", route: "/campaigns" },
];

const studioTools = [
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

const recentCreations = [
  {
    id: "1",
    title: "Cyberpunk Studio Workspace",
    type: "Image",
    typeBadge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    img: "/studio-cards/image-generator.png",
    time: "25m ago",
    href: "/image-studio",
  },
  {
    id: "2",
    title: "Viral SaaS Launch Script",
    type: "Copy",
    typeBadge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    img: "/studio-cards/ai-content-studio.png",
    time: "2 hours ago",
    href: "/ai-studio",
  },
  {
    id: "3",
    title: "Minimal 3D Product Reel",
    type: "Video",
    typeBadge: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    img: "/studio-cards/video-reel-studio.png",
    time: "Yesterday",
    href: "/image-studio?tab=video",
  },
  {
    id: "4",
    title: "Q4 Multi-Platform Blitz",
    type: "Campaign",
    typeBadge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    img: "/studio-cards/campaign-generator.png",
    time: "3 days ago",
    href: "/campaigns",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string>("image");
  const [prompt, setPrompt] = useState<string>("");

  const currentMode = quickModes.find((m) => m.id === selectedMode) || quickModes[0];

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = prompt.trim();
    if (selectedMode === "video") {
      router.push(`/image-studio?tab=video${query ? `&prompt=${encodeURIComponent(query)}` : ""}`);
    } else if (selectedMode === "image") {
      router.push(`/image-studio${query ? `&prompt=${encodeURIComponent(query)}` : ""}`);
    } else if (selectedMode === "copy") {
      router.push(`/ai-studio${query ? `&prompt=${encodeURIComponent(query)}` : ""}`);
    } else if (selectedMode === "campaign") {
      router.push(`/campaigns${query ? `&prompt=${encodeURIComponent(query)}` : ""}`);
    }
  };

  const handleExploreScroll = () => {
    const el = document.getElementById("creative-tools");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full max-w-full text-white font-sans antialiased overflow-x-hidden pb-12">
      {/* 1. CLEAN RESTRAINED HERO SECTION */}
      <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Subtle Ambient Background Gradient Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-[240px] sm:h-[320px] rounded-full pointer-events-none opacity-20 blur-[90px] -z-10"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.65) 0%, rgba(236,72,153,0.3) 50%, transparent 75%)",
          }}
        />

        {/* Small Elegant Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-white/80 mb-6 shadow-sm">
          <Sparkles size={13} className="text-violet-400" />
          <span>Next-Generation AI Creative Studio</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.08] max-w-3xl">
          Create. Design. Publish.
        </h1>

        {/* Supporting text */}
        <p className="text-[15px] sm:text-[17px] text-white/60 font-normal mt-4 max-w-2xl leading-relaxed">
          Your AI-powered creative workspace for generating content, visuals, videos, and campaigns.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <Link
            href="/ai-studio"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-[14px] font-medium shadow-[0_0_24px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition duration-200"
          >
            <span>Start Creating</span>
            <ArrowRight size={15} />
          </Link>
          <button
            type="button"
            onClick={handleExploreScroll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] hover:border-white/[0.18] text-white/80 hover:text-white text-[14px] font-medium transition duration-200"
          >
            <span>Explore Tools</span>
          </button>
        </div>
      </section>

      {/* 2. AI COMMAND CENTER (Central Interaction Point) */}
      <section className="max-w-3xl mx-auto px-4 mb-20">
        <div className="bg-[#0E0E17] border border-white/[0.08] rounded-[20px] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] sm:text-[19px] font-semibold text-white tracking-tight">
              What do you want to create?
            </h2>
            <span className="text-[11px] font-medium uppercase tracking-wider text-violet-400/90 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              AI Command Center
            </span>
          </div>

          {/* Large Prompt Input Form */}
          <form onSubmit={handleGenerate} className="relative">
            <div className="relative flex items-center bg-[#07070F] border border-white/[0.09] focus-within:border-violet-500/60 rounded-[14px] px-4 py-3 transition">
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={currentMode.placeholder || "Describe your idea..."}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                className="w-full bg-transparent border-none outline-none text-white text-[14px] placeholder-white/35 resize-none pr-32"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-[12.5px] font-medium shadow-[0_0_14px_rgba(139,92,246,0.3)] transition"
              >
                <Sparkles size={13} />
                <span>Generate with AI</span>
              </button>
            </div>
          </form>

          {/* Quick Action Buttons Below */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/[0.05]">
            <span className="text-[12px] text-white/40 mr-1 font-medium">Quick modes:</span>
            {quickModes.map(({ id, label, icon: Icon }) => {
              const isSelected = selectedMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedMode(id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition ${
                    isSelected
                      ? "bg-violet-600/20 border border-violet-500/40 text-violet-200"
                      : "bg-white/[0.03] border border-white/[0.07] text-white/65 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon size={13} className={isSelected ? "text-violet-300" : "text-white/45"} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CREATIVE TOOLS STUDIO (Responsive 3-Column Grid on Desktop) */}
      <section id="creative-tools" className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-violet-400">
              PRODUCTION ENGINES
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

              {/* Card Details */}
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
      </section>

      {/* 4. RECENT CREATIONS SECTION */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 mb-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-violet-400">
              Workspace History
            </span>
            <h2 className="text-[22px] md:text-[26px] font-semibold text-white tracking-tight mt-1">
              Recent Creations
            </h2>
            <p className="text-[14px] text-white/55 mt-1">
              Jump back into your recent assets, visuals, and marketing copies.
            </p>
          </div>
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-violet-400 hover:text-violet-300 transition no-underline"
          >
            <span>View all creations</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Thumbnail Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentCreations.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group bg-[#0E0E17] hover:bg-[#131320] border border-white/[0.08] hover:border-violet-500/30 rounded-[16px] overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col no-underline text-inherit cursor-pointer"
            >
              {/* Thumbnail Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#07070C]">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className={`px-2 py-0.5 rounded-full border text-[10.5px] font-medium backdrop-blur-md ${item.typeBadge}`}>
                    {item.type}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h4 className="text-[14px] font-semibold text-white truncate group-hover:text-violet-200 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between text-[11.5px] text-white/45 mt-3 pt-2.5 border-t border-white/[0.05]">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} className="text-white/40" />
                    {item.time}
                  </span>
                  <span className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium inline-flex items-center gap-0.5">
                    Open <ExternalLink size={11} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
