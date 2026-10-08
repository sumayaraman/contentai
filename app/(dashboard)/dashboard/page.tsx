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
    <div className="bg-[#07070F] text-white min-h-screen -m-3.5 sm:-m-6 lg:-m-8 p-3.5 sm:p-6 lg:p-8 font-sans antialiased">
      {/* 1. CLEAN SPACIOUS HERO HEADER */}
      <section className="px-8 pt-12 pb-8 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 shadow-sm mb-6">
          <Sparkles size={13} className="text-violet-400" />
          <span>ContentAI Creative Suite</span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight leading-[1.1] text-white max-w-3xl mx-auto">
          AI Content, Images,{" "}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            Videos, and Tools
          </span>{" "}
          in One Place
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] text-white/60 font-normal mt-3 max-w-2xl mx-auto leading-relaxed">
          Turn ideas into visuals and workflows instantly. Generate AI images, create videos,
          write viral copy, and explore powerful tools—without complexity.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          <Link
            href="/ai-studio"
            className="btn-hero-glow"
          >
            <span>Get started for free</span>
            <Sparkles size={14} />
          </Link>
          <Link
            href="/image-studio"
            className="btn btn-primary"
            style={{ borderRadius: 9999, padding: "10px 22px", fontSize: 13.5 }}
          >
            <ImageIcon size={14} />
            <span>Image Studio</span>
          </Link>
        </div>
      </section>

      {/* 2. SECTIONS FILTER ROW */}
      <div className="max-w-[1400px] mx-auto px-8 mt-6">
        <div className="flex flex-wrap gap-3 py-5 border-t border-white/10">
          <span className="px-4 py-1.5 rounded-full bg-white text-black text-[12px] font-medium cursor-pointer select-none">
            All Sections
          </span>
          <Link
            href="/ai-studio"
            className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-[12px] hover:bg-white/15 transition no-underline"
          >
            Creative Tools Studio
          </Link>
          <Link
            href="/image-studio"
            className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-[12px] hover:bg-white/15 transition no-underline"
          >
            Image Studio
          </Link>
          <Link
            href="/ai-studio"
            className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-[12px] hover:bg-white/15 transition no-underline"
          >
            Instant Playground
          </Link>
          <Link
            href="/analytics"
            className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-[12px] hover:bg-white/15 transition no-underline"
          >
            Performance Metrics
          </Link>
          <Link
            href="/ai-assistant"
            className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-[12px] hover:bg-white/15 transition no-underline"
          >
            AI Assistant
          </Link>
        </div>
      </div>

      {/* 3. PRODUCTION ENGINES + CREATIVE TOOLS STUDIO TITLES */}
      <div className="max-w-[1400px] mx-auto px-8 mt-12">
        <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase">PRODUCTION ENGINES</p>
        <div className="mt-8 flex justify-between items-end">
          <div>
            <h2 className="text-[22px] font-semibold text-white">Creative Tools Studio</h2>
            <p className="text-[13px] text-white/50 mt-1">
              Access all 8 specialized engines to generate copy, visuals, schedules, and campaigns.
            </p>
          </div>
          <span className="text-[11px] text-white/30 hidden sm:inline-block">8 Production Engines</span>
        </div>
      </div>

      {/* 4. CARDS GRID - 8 CARDS WITH 100PX (PB-24) PADDING AT END */}
      <div className="max-w-[1400px] mx-auto px-8 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-24">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group bg-[#18181F] border border-white/[0.07] rounded-[24px] overflow-hidden hover:bg-[#1E1E28] hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300 cursor-pointer block no-underline text-inherit shadow-md hover:shadow-xl"
          >
            {/* IMAGE PART */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#0E0E14] m-2.5 mb-0 rounded-[16px] w-[calc(100%-20px)]">
              <img
                src={tool.img}
                alt={tool.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* TEXT PART */}
            <div className="p-5 pt-4">
              <h3 className="text-[15px] font-semibold text-white leading-tight truncate">
                {tool.title}
              </h3>
              <p className="text-[13px] text-white/55 leading-snug mt-1.5 line-clamp-2">
                {tool.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
