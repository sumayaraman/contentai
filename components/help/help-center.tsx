"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Command,
  Copy,
  FolderOpen,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  PenSquare,
  Search,
  Send,
  Share2,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "faq-1",
    category: "getting-started",
    question: "How does ContentAI generate content without requiring an API key?",
    answer:
      "ContentAI features an automated intelligent fallback engine ('Demo Mode'). If no external OpenAI, Anthropic, or Groq API key is configured in your environment, ContentAI automatically produces structured marketing copy, campaign strategies, and visual directions using deterministic heuristic templates so you can explore every feature uninterrupted.",
  },
  {
    id: "faq-2",
    category: "image-studio",
    question: "How do I download or use images created in Image Studio?",
    answer:
      "When an image is generated in Image Studio, it is automatically stored in your workspace Media Library. You can click on any image to copy its public URL, preview it at full resolution, or attach it directly to posts across Instagram, Facebook, LinkedIn, and X.",
  },
  {
    id: "faq-3",
    category: "publishing",
    question: "What is the difference between Simulated Dispatch and Real Publishing?",
    answer:
      "By default, newly created social connections operate in 'Simulated Mode' to allow end-to-end rehearsal of your content calendar and queue timing without publishing live to public feeds. Once Meta, LinkedIn, or X API credentials are provided in your environment, dispatches automatically publish to your authorized accounts.",
  },
  {
    id: "faq-4",
    category: "campaigns",
    question: "Can I transfer an entire multi-day campaign into my calendar?",
    answer:
      "Yes! When generating a 7-day, 14-day, or 30-day marketing arc in Campaign Planner, clicking 'Schedule All Posts' automatically creates draft posts mapped to appropriate calendar dates and assigns them to the active workspace.",
  },
  {
    id: "faq-5",
    category: "getting-started",
    question: "How do workspace roles and permissions work?",
    answer:
      "Workspaces support OWNER, ADMIN, and MEMBER roles. Owners hold complete billing, workspace renaming, and deletion privileges; Admins can invite teammates, manage AI provider settings, and connect social accounts; Members can create, edit, and schedule drafts.",
  },
  {
    id: "faq-6",
    category: "image-studio",
    question: "What image aspect ratios are supported?",
    answer:
      "Image Studio supports 1:1 (Square for Instagram/Facebook feeds), 16:9 (Landscape for LinkedIn and X articles), and 9:16 (Vertical for Instagram Stories and Reels). Prompts can also include custom aesthetic styles like Minimalist, Studio Lighting, Cyberpunk, or Watercolor.",
  },
];

const quickGuides = [
  {
    title: "AI Studio Briefs",
    tag: "Creation",
    icon: Wand2,
    desc: "Generate full post captions, hooks, calls to action, and hashtags from a single idea with platform-aware formatting.",
    href: "/ai-studio",
  },
  {
    title: "Image & Video Studio",
    tag: "Visuals",
    icon: Sparkles,
    desc: "Render high-definition marketing visuals, product mockups, and video prompts with custom brand color palettes.",
    href: "/image-studio",
  },
  {
    title: "Campaign Planner",
    tag: "Strategy",
    icon: BookOpen,
    desc: "Design comprehensive 7, 14, or 30-day marketing arcs with automated scheduling directly into your content calendar.",
    href: "/campaigns",
  },
  {
    title: "Publishing & Queues",
    tag: "Automation",
    icon: Share2,
    desc: "Review scheduled queues, simulate dispatches, inspect post history, and track multi-channel delivery status.",
    href: "/publishing",
  },
];

const keyboardShortcuts = [
  { key: "Ctrl + K", action: "Global quick search across posts and media" },
  { key: "Ctrl + Enter", action: "Submit prompt in AI Studio or Image Studio" },
  { key: "Esc", action: "Close modals, dialogs, and open dropdown menus" },
  { key: "Tab", action: "Navigate sequentially through form inputs and buttons" },
];

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function handleCopyEmail() {
    navigator.clipboard.writeText("support@contentai.dev");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  function handleSendSupport(e: React.FormEvent) {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSent(true);
    setSupportMessage("");
    setTimeout(() => setSupportSent(false), 5000);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-14 pb-24">
      {/* Centered Hero Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 shadow-sm">
          <HelpCircle size={15} /> Help &amp; Documentation Center
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          How can we help you today?
        </h1>
        <p className="text-sm sm:text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
          Master ContentAI tools, explore step-by-step feature guides, and discover quick answers to common questions.
        </p>

        {/* Centered Search Bar */}
        <div className="pt-4 max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#121226]/90 p-3 backdrop-blur-2xl shadow-2xl transition duration-200 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/15">
            <div className="flex items-center gap-4 px-3">
              <Search size={22} className="text-violet-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides, workflows, or FAQs..."
                className="w-full bg-transparent py-2 text-sm sm:text-base text-white placeholder:text-white/40 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-medium text-white/50 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.06] transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition"
          >
            {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copiedEmail ? "Copied support email!" : "Need direct help? support@contentai.dev"}
          </button>
        </div>
      </div>

      {/* Feature Guides Grid - Spacious 2 columns */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <h2 className="text-base font-semibold text-white">Feature Guides</h2>
          <span className="text-xs text-white/40">4 essential workflows</span>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {quickGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.title}
                href={guide.href}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#101020]/80 p-8 backdrop-blur-2xl shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/35 hover:bg-[#14142a]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 text-violet-400 transition group-hover:scale-105">
                      <Icon size={22} />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs font-semibold text-violet-300">
                      {guide.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-violet-300 transition">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">
                    {guide.desc}
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-violet-400">
                  <span>Explore tool</span>
                  <ChevronRight size={15} className="transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#101020]/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-8">
        <div className="flex flex-col justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
            <p className="mt-1 text-xs sm:text-sm text-white/50">Everything you need to know about AI models, generation limits, and publishing.</p>
          </div>
        </div>

        {/* Category filter pills row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {[
            { id: "all", label: "All Topics" },
            { id: "getting-started", label: "Getting Started" },
            { id: "image-studio", label: "Image Studio" },
            { id: "publishing", label: "Publishing" },
            { id: "campaigns", label: "Campaigns" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-2xl px-5 py-2.5 text-xs font-medium transition duration-200 ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25"
                  : "bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List - Each question as an elevated accordion card */}
        <div className="space-y-4 pt-2">
          {filteredFaqs.length === 0 ? (
            <div className="py-16 text-center text-sm text-white/40">
              No questions found matching &ldquo;{searchQuery}&rdquo;. Try another search term or contact our support team below.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-white/[0.08] bg-[#14142a]/70 p-6 transition-all duration-200 hover:border-violet-500/35 shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xs font-bold text-violet-400 border border-violet-500/20">
                        ?
                      </span>
                      <span className="text-base font-semibold text-white/95 hover:text-violet-300 transition">
                        {faq.question}
                      </span>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/50 border border-white/[0.08]">
                      <ChevronDown
                        size={17}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-violet-400" : ""}`}
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-5 pt-4 border-t border-white/[0.06] pl-11 pr-2">
                      <p className="text-sm text-white/70 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2-column Bottom Section: Keyboard Shortcuts & Support */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Keyboard Shortcuts Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#101020]/80 p-8 sm:p-10 backdrop-blur-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3.5 pb-5 border-b border-white/[0.08]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Command size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-white/50 mt-0.5">Speed up your content creation workflow with quick hotkeys.</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {keyboardShortcuts.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#14142a]/60 px-5 py-4"
              >
                <span className="text-xs sm:text-sm text-white/70">{item.action}</span>
                <kbd className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1 font-mono text-xs font-semibold text-white/90 shadow-sm">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#101020]/80 p-8 sm:p-10 backdrop-blur-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3.5 pb-5 border-b border-white/[0.08]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Need Personal Help?</h2>
              <p className="text-xs text-white/50 mt-0.5">Send an inquiry directly to the ContentAI support team.</p>
            </div>
          </div>

          {supportSent ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check size={28} />
              </div>
              <p className="text-base font-semibold text-emerald-300">Message Received!</p>
              <p className="text-xs sm:text-sm text-white/50 max-w-xs">
                Thanks for reaching out. A support engineer will review your inquiry shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendSupport} className="space-y-5">
              <div>
                <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Your Message
                </label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={4}
                  placeholder="Describe your question, feature request, or issue in detail..."
                  className="w-full rounded-2xl border border-white/10 bg-[#16162e] p-4 text-xs sm:text-sm text-white placeholder:text-white/35 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500"
              >
                <Send size={15} /> Send Message to Support
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
