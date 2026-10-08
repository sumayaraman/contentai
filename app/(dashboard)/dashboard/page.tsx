"use client";

import Link from "next/link";
import { Sparkles, ImageIcon } from "lucide-react";

const tools = [
  {
    title: "Image Generator",
    desc: "Create stunning AI images with magic",
    img: "/studio-cards/image-generator.png",
    href: "/image-studio",
  },
  {
    title: "AI Content Studio",
    desc: "Magical AI writing & content",
    img: "/studio-cards/ai-content-studio.png",
    href: "/ai-studio",
  },
  {
    title: "Video & Reel Studio",
    desc: "Generate viral videos with AI",
    img: "/studio-cards/video-reel-studio.png",
    href: "/image-studio?tab=video",
  },
  {
    title: "Campaign Generator",
    desc: "Launch campaigns in one click",
    img: "/studio-cards/campaign-generator.png",
    href: "/campaigns",
  },
  {
    title: "Content Calendar",
    desc: "Plan & schedule magically",
    img: "/studio-cards/content-calendar.png",
    href: "/calendar",
  },
  {
    title: "Social Publishing Hub",
    desc: "Publish to all platforms",
    img: "/studio-cards/social-publishing.png",
    href: "/publishing",
  },
  {
    title: "Content Intelligence",
    desc: "Smart analytics & insights",
    img: "/studio-cards/content-intelligence.png",
    href: "/analytics",
  },
  {
    title: "Media & Asset Cloud",
    desc: "All your assets in one cloud",
    img: "/studio-cards/media-asset-cloud.png",
    href: "/media-library",
  },
];

export default function DashboardPage() {
  return (
    <div className="w-full text-white font-sans antialiased">
      {/* UNIFIED CONTAINER FOR ROCK-SOLID ALIGNMENT */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. CLEAN SPACIOUS HERO HEADER - CENTERED IN THE MIDDLE */}
        <section className="w-full pt-12 pb-10 sm:pt-16 sm:pb-14 flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 text-xs font-semibold text-violet-300 shadow-sm mb-6">
              <Sparkles size={13} className="text-violet-400" />
              <span>ContentAI Creative Suite</span>
            </div>

            {/* Title */}
            <h1 className="w-full text-center text-[36px] sm:text-[44px] md:text-[48px] font-semibold tracking-tight leading-[1.15] text-white">
              AI Content, Images,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                Videos, and Tools
              </span>{" "}
              in One Place
            </h1>

            {/* Subtitle */}
            <p className="w-full max-w-2xl text-center text-[15px] sm:text-[16px] text-white/60 font-normal mt-4 leading-relaxed mx-auto">
              Turn ideas into visuals and workflows instantly. Generate AI images, create videos,
              write viral copy, and explore powerful tools—without complexity.
            </p>

            {/* Action Buttons - Generous space above and below */}
            <div className="w-full flex flex-wrap items-center justify-center gap-4 mt-10">
              <Link
                href="/ai-studio"
                className="h-11 px-6 rounded-full inline-flex items-center justify-center gap-2 text-[13.5px] font-medium bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_26px_rgba(139,92,246,0.5)] transition duration-200"
              >
                <span>Get started for free</span>
                <Sparkles size={14} />
              </Link>
              <Link
                href="/image-studio"
                className="h-11 px-6 rounded-full inline-flex items-center justify-center gap-2 text-[13.5px] font-medium bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.12] hover:border-white/[0.22] text-white/90 hover:text-white transition duration-200"
              >
                <ImageIcon size={14} />
                <span>Image Studio</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. SECTIONS FILTER ROW WITH GENEROUS BREATHING SPACE */}
        <div className="w-full mt-14 sm:mt-20 mb-16 sm:mb-20 py-6 border-y border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-5 py-2 rounded-full bg-white text-black text-[12.5px] font-medium cursor-pointer select-none shadow-sm">
              All Sections
            </span>
            <Link
              href="/ai-studio"
              className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white/80 hover:text-white text-[12.5px] font-medium transition no-underline"
            >
              Creative Tools Studio
            </Link>
            <Link
              href="/image-studio"
              className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white/80 hover:text-white text-[12.5px] font-medium transition no-underline"
            >
              Image Studio
            </Link>
            <Link
              href="/ai-studio"
              className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white/80 hover:text-white text-[12.5px] font-medium transition no-underline"
            >
              Instant Playground
            </Link>
            <Link
              href="/analytics"
              className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white/80 hover:text-white text-[12.5px] font-medium transition no-underline"
            >
              Performance Metrics
            </Link>
            <Link
              href="/ai-assistant"
              className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] text-white/80 hover:text-white text-[12.5px] font-medium transition no-underline"
            >
              AI Assistant
            </Link>
          </div>
        </div>

        {/* 3. PRODUCTION ENGINES TITLE WITH ROOMY SPACING */}
        <div className="w-full mb-10 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold tracking-wider text-violet-300 uppercase mb-3">
                <Sparkles size={11} className="text-violet-400" />
                <span>Production Engines</span>
              </div>
              <h2 className="text-[24px] sm:text-[28px] font-semibold text-white tracking-tight leading-tight">
                Creative Tools Studio
              </h2>
              <p className="text-[14px] text-white/55 mt-2 max-w-2xl leading-relaxed">
                Access all 8 specialized engines to generate copy, visuals, schedules, and campaigns.
              </p>
            </div>
            <span className="text-[12.5px] text-white/40 font-medium shrink-0 pb-1">
              8 Production Engines
            </span>
          </div>
        </div>

        {/* 4. CARDS GRID - 8 CARDS WITH UNIFIED MARGINS & SPACIOUS BOTTOM PADDING */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-28">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group bg-[#111119] border border-white/[0.08] hover:border-violet-500/30 rounded-[20px] overflow-hidden hover:bg-[#151522] hover:-translate-y-1 transition-all duration-300 cursor-pointer block no-underline text-inherit shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
            >
              {/* IMAGE PART */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#09090F] m-2.5 mb-0 rounded-[14px] w-[calc(100%-20px)]">
                <img
                  src={tool.img}
                  alt={tool.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>

              {/* TEXT PART */}
              <div className="p-5 pt-4">
                <h3 className="text-[15px] font-semibold text-white leading-tight truncate group-hover:text-violet-200 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-[13px] text-white/55 leading-relaxed mt-1.5 line-clamp-2">
                  {tool.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
