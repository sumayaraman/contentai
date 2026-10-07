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
    <div className="bg-[#fbfbfb] text-gray-900 min-h-screen -m-3.5 sm:-m-6 lg:-m-8 p-3.5 sm:p-6 lg:p-8 font-sans antialiased">
      {/* 1. CLEAN SPACIOUS HEADER */}
      <section className="px-8 pt-12 pb-8 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-100 bg-violet-50 text-xs font-semibold text-violet-600 shadow-sm mb-6">
          <Sparkles size={13} className="text-violet-500" />
          <span>ContentAI Creative Suite</span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-[36px] md:text-[44px] font-semibold tracking-tight leading-[1.1] text-gray-900 max-w-3xl mx-auto">
          AI Content, Images,{" "}
          <span className="bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
            Videos, and Tools
          </span>{" "}
          in One Place
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] text-gray-500 font-normal mt-3 max-w-2xl mx-auto leading-relaxed">
          Turn ideas into visuals and workflows instantly. Generate AI images, create videos,
          write viral copy, and explore powerful tools—without complexity.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          <Link
            href="/ai-studio"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white font-medium text-[13px] hover:bg-black transition shadow-sm no-underline"
          >
            <span>Get started for free</span>
            <Sparkles size={14} />
          </Link>
          <Link
            href="/image-studio"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 font-medium text-[13px] hover:bg-gray-50 transition shadow-sm no-underline"
          >
            <ImageIcon size={14} />
            <span>Image Studio</span>
          </Link>
        </div>
      </section>

      {/* 2. AIRY FILTER PILLS ROW */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-10">
        <div className="flex flex-wrap gap-2.5 py-6 border-y border-gray-200">
          <span className="text-[12px] px-3.5 py-1.5 rounded-full bg-gray-900 text-white cursor-pointer select-none">
            All Sections
          </span>
          <Link
            href="/ai-studio"
            className="text-[12px] px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition no-underline"
          >
            Creative Tools Studio
          </Link>
          <Link
            href="/image-studio"
            className="text-[12px] px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition no-underline"
          >
            Image Studio
          </Link>
          <Link
            href="/ai-studio"
            className="text-[12px] px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition no-underline"
          >
            Instant Playground
          </Link>
          <Link
            href="/analytics"
            className="text-[12px] px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition no-underline"
          >
            Performance Metrics
          </Link>
          <Link
            href="/ai-assistant"
            className="text-[12px] px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition no-underline"
          >
            AI Assistant
          </Link>
        </div>
      </div>

      {/* 3. PRODUCTION ENGINES + CREATIVE TOOLS STUDIO TITLES */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-16">
        <p className="text-[11px] tracking-[0.14em] font-semibold text-gray-400 uppercase">
          PRODUCTION ENGINES
        </p>
        <div className="mt-10">
          <h2 className="text-[22px] font-semibold text-gray-900">Creative Tools Studio</h2>
          <p className="text-[13px] text-gray-500 mt-1.5">
            Access all 8 specialized engines to generate copy, visuals, schedules, and campaigns.
          </p>
        </div>
        <div className="mt-8 flex justify-between items-center">
          <h3 className="text-[20px] font-semibold text-gray-900">Explore Studio Tools</h3>
          <span className="text-[12px] text-gray-400">8 Available Studios</span>
        </div>
      </div>

      {/* 4. CARDS GRID - 8 CARDS WITH 100PX (PB-24) PADDING AT END */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-24">
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
