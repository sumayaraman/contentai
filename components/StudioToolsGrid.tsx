import Image from "next/image"
import Link from "next/link"

const tools = [
  {
    title: "Image Generator",
    desc: "Create stunning AI images with magic",
    img: "/studio-cards/image-generator.png",
    color: "from-purple-500/20 to-pink-500/20",
    href: "/image-studio",
  },
  {
    title: "AI Content Studio",
    desc: "Magical AI writing & content",
    img: "/studio-cards/ai-content-studio.png",
    color: "from-blue-500/20 to-cyan-500/20",
    href: "/ai-studio",
  },
  {
    title: "Video & Reel Studio",
    desc: "Generate viral videos with AI",
    img: "/studio-cards/video-reel-studio.png",
    color: "from-orange-500/20 to-red-500/20",
    href: "/image-studio?tab=video",
  },
  {
    title: "Campaign Generator",
    desc: "Launch campaigns in one click",
    img: "/studio-cards/campaign-generator.png",
    color: "from-green-500/20 to-emerald-500/20",
    href: "/campaigns",
  },
  {
    title: "Content Calendar",
    desc: "Plan & schedule magically",
    img: "/studio-cards/content-calendar.png",
    color: "from-violet-500/20 to-purple-500/20",
    href: "/calendar",
  },
  {
    title: "Social Publishing Hub",
    desc: "Publish to all platforms",
    img: "/studio-cards/social-publishing.png",
    color: "from-pink-500/20 to-rose-500/20",
    href: "/publishing",
  },
  {
    title: "Content Intelligence",
    desc: "Smart analytics & insights",
    img: "/studio-cards/content-intelligence.png",
    color: "from-yellow-500/20 to-orange-500/20",
    href: "/analytics",
  },
  {
    title: "Media & Asset Cloud",
    desc: "All your assets in one cloud",
    img: "/studio-cards/media-asset-cloud.png",
    color: "from-indigo-500/20 to-blue-500/20",
    href: "/media-library",
  },
]

export default function StudioToolsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 p-2">
      {tools.map((tool) => (
        <Link
          key={tool.title}
          href={tool.href}
          className="group relative rounded-[28px] bg-[#12121A]/70 backdrop-blur-xl border border-white/[0.08] p-5 overflow-hidden hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-white/[0.15] transition-all duration-300 cursor-pointer block"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          <div className="relative z-10">
            <div className="w-full aspect-[16/10] rounded-[20px] overflow-hidden bg-[#0A0A0F] mb-5 border border-white/5">
              <Image
                src={tool.img}
                alt={tool.title}
                width={400}
                height={250}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h3 className="text-[16px] font-semibold text-white mb-1.5 tracking-tight">{tool.title}</h3>
            <p className="text-[13px] text-white/60 leading-relaxed">{tool.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
