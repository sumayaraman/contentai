"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AIAssistant() {
  const pathname = usePathname();

  // Hide floating button when already on the AI Assistant page
  if (pathname === "/ai-assistant") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/ai-assistant"
        className="h-14 w-14 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] shadow-[0_8px_30px_rgba(139,92,246,0.5)] flex items-center justify-center text-xl hover:scale-105 transition no-underline text-white"
        aria-label="Open AI Assistant"
        title="Open AI Assistant"
      >
        🤖
      </Link>
    </div>
  );
}
