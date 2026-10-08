import Link from "next/link"

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
]

export default function StudioToolsGrid() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-8 px-1">
        <div>
          <h2 className="text-[28px] font-bold text-white tracking-tight">Explore Studio Tools</h2>
          <p className="text-[14px] text-white/50 mt-1.5">
            Launch any creator engine to generate copy, visuals, schedules, and campaigns.
          </p>
        </div>
        <span className="text-[13px] text-white/40 font-medium hidden md:block">8 Available Studios</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="group bg-[#18181F] border border-white/[0.07] rounded-[24px] overflow-hidden hover:bg-[#1E1E28] hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300 cursor-pointer block no-underline text-inherit"
          >
            {/* IMAGE PART - SEPARATE */}
            <div className="relative aspect-[16/10] overflow-hidden bg-[#0E0E14] m-2.5 mb-0 rounded-[16px] w-[calc(100%-20px)]">
              <img
                src={tool.img}
                alt={tool.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* TEXT PART - CLEAN WITH PADDING */}
            <div className="p-5 pt-4">
              <h3 className="text-[15px] font-semibold text-white leading-tight truncate">{tool.title}</h3>
              <p className="text-[13px] text-white/55 leading-snug mt-1.5 line-clamp-2">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
