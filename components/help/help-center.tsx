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
  HelpCircle,
  MessageSquare,
  Search,
  Send,
  Share2,
  Sparkles,
  Wand2,
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
    <div className="space-y-8">
      {/* Top Search & Direct Support Bar - Styled like Campaign Brief Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-4 sm:p-5 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, workflows, or FAQs..."
              className="h-11 w-full rounded-xl border border-white/10 bg-[#121224] pl-10 pr-20 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white/50 hover:text-white px-2 py-1 rounded-md bg-white/[0.06] transition"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={handleCopyEmail}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.08] transition"
          >
            {copiedEmail ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-300">Copied support email!</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-violet-400" />
                <span>Need direct help? support@contentai.dev</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature Guides Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Feature Guides</h2>
            <p className="text-xs text-white/50 mt-0.5">
              Quick walkthroughs and direct shortcuts to essential platform tools
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            4 essential workflows
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {quickGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.title}
                href={guide.href}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-5 backdrop-blur-xl shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-[#121224]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 text-violet-400 transition group-hover:scale-105">
                      <Icon size={19} />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">
                      {guide.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white group-hover:text-violet-300 transition">
                    {guide.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-white/60 leading-relaxed line-clamp-3">
                    {guide.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-violet-400">
                  <span>Explore tool</span>
                  <ChevronRight size={14} className="transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions Section */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Everything you need to know about AI models, generation limits, and publishing.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center self-start sm:self-auto rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/60">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {/* Category filter pills row */}
        <div className="flex flex-wrap items-center gap-2">
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
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition duration-200 ${
                activeCategory === cat.id
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                  : "bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3 pt-1">
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/40">
              No questions found matching &ldquo;{searchQuery}&rdquo;. Try another search term or contact our support team below.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-white/[0.08] bg-[#121224]/70 p-4 sm:p-5 transition-all duration-200 hover:border-violet-500/30 shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-400 border border-violet-500/20">
                        ?
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-white/95 hover:text-violet-300 transition">
                        {faq.question}
                      </span>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/50 border border-white/[0.08]">
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-violet-400" : ""}`}
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-4 pt-3.5 border-t border-white/[0.06] pl-10 pr-2">
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Keyboard Shortcuts Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Command size={19} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-white/50 mt-0.5">Speed up your content creation workflow with quick hotkeys.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {keyboardShortcuts.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#121224]/60 px-4 py-3"
              >
                <span className="text-xs sm:text-sm text-white/70">{item.action}</span>
                <kbd className="rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 font-mono text-xs font-semibold text-white/90 shadow-sm">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e1a]/85 p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <MessageSquare size={19} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">Need Personal Help?</h2>
              <p className="text-xs text-white/50 mt-0.5">Send an inquiry directly to the ContentAI support team.</p>
            </div>
          </div>

          {supportSent ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check size={24} />
              </div>
              <p className="text-sm font-semibold text-emerald-300">Message Received!</p>
              <p className="text-xs text-white/50 max-w-xs">
                Thanks for reaching out. A support engineer will review your inquiry shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendSupport} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Your Message
                </label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={3}
                  placeholder="Describe your question, feature request, or issue in detail..."
                  className="w-full rounded-xl border border-white/10 bg-[#121224] p-3.5 text-xs sm:text-sm text-white placeholder:text-white/35 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition hover:from-violet-500 hover:to-indigo-500"
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
