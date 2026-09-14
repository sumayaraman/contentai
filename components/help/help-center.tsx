"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  Image,
  Keyboard,
  Layers,
  Megaphone,
  MessageSquare,
  Search,
  Send,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "faq-1",
    category: "getting-started",
    question: "How does ContentAI generate content without requiring an API key?",
    answer:
      "ContentAI features an automated intelligent fallback engine ('Demo Mode'). If no external OpenAI, Anthropic, or Groq API key is configured in your workspace environment, ContentAI automatically produces structured marketing copy, campaign strategies, and visual directions using deterministic heuristic templates so you can explore every feature uninterrupted.",
  },
  {
    id: "faq-2",
    category: "image-studio",
    question: "How do I download or use images created in Image Studio?",
    answer:
      "Every generated image in Image Studio can be saved directly to your workspace Media Library with the 'Save to Library' button, or downloaded directly to your device via the 'Download' button. Saved assets can then be attached to any post in the Post Editor.",
  },
  {
    id: "faq-3",
    category: "publishing",
    question: "What is the difference between Simulated Dispatch and Real Publishing?",
    answer:
      "Simulated Dispatch tests your publishing schedule, webhook pipelines, and queue logic without requiring live developer credentials from Meta, X, or LinkedIn. When you're ready for real publishing, connect your accounts in Settings → Social Accounts using OAuth 2.0.",
  },
  {
    id: "faq-4",
    category: "campaigns",
    question: "Can I transfer an entire multi-day campaign into my calendar?",
    answer:
      "Yes! When you generate a campaign in the Campaigns Studio, clicking 'Schedule All to Calendar' will automatically create individual scheduled posts for each day and slot them into your Content Calendar starting from your designated launch date.",
  },
  {
    id: "faq-5",
    category: "workspace",
    question: "How do workspace roles and permissions work?",
    answer:
      "Workspaces have three permission tiers: OWNER (full administrative control, billing, workspace deletion), ADMIN (manage content, team members, and AI settings), and MEMBER (create, edit, and schedule posts).",
  },
  {
    id: "faq-6",
    category: "image-studio",
    question: "What image aspect ratios are supported?",
    answer:
      "Image Studio supports 1:1 Square (ideal for Instagram posts and feeds), 16:9 Wide (ideal for YouTube thumbnails, LinkedIn banners, and X posts), and 9:16 Tall (ideal for Instagram Stories, Reels, and TikTok cover graphics).",
  },
];

const quickGuides = [
  {
    title: "AI Studio Briefs",
    tag: "Creation",
    icon: Sparkles,
    desc: "Generate full captions, hooks, calls to action, and hashtags from a single idea.",
    href: "/ai-studio",
  },
  {
    title: "Image & Video Studio",
    tag: "Visuals",
    icon: Image,
    desc: "Render high-definition marketing visuals, product mockups, and video clips.",
    href: "/image-studio",
  },
  {
    title: "Campaign Planner",
    tag: "Strategy",
    icon: Megaphone,
    desc: "Design comprehensive 7, 14, or 30-day marketing arcs with automated prompts.",
    href: "/campaigns",
  },
  {
    title: "Publishing & Queues",
    tag: "Automation",
    icon: Share2,
    desc: "Review scheduled queues, simulate dispatches, and track multi-channel delivery.",
    href: "/publishing",
  },
];

const keyboardShortcuts = [
  { key: "Ctrl + K", action: "Global search across posts and media" },
  { key: "Ctrl + Enter", action: "Submit prompt in AI Studio or Image Studio" },
  { key: "Esc", action: "Close modals, previews, and open dropdown menus" },
  { key: "Tab", action: "Navigate through form inputs and buttons" },
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
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
            <HelpCircle size={13} /> Knowledge Base &amp; Support
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Help &amp; Documentation</h1>
          <p className="mt-1 text-sm text-white/50">
            Master ContentAI workflows, explore tutorials, and find quick answers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.08] hover:text-white"
          >
            {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copiedEmail ? "Copied support email!" : "Copy Support Email"}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-2.5 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3 px-3">
          <Search size={18} className="text-white/40 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, tutorials, or frequently asked questions..."
            className="w-full bg-transparent py-2 text-sm text-white placeholder:text-white/40 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-medium text-white/40 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Guides Grid */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Feature Guides</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.title}
                href={guide.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-5 backdrop-blur-xl shadow-lg transition hover:border-violet-500/30 hover:bg-[#131322]/90"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400 transition group-hover:scale-105">
                      <Icon size={18} />
                    </div>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/50 tracking-wider">
                      {guide.tag}
                    </span>
                  </div>
                  <div className="mt-4 text-sm font-semibold text-white group-hover:text-violet-300 transition">
                    {guide.title}
                  </div>
                  <p className="mt-1 text-xs text-white/50 line-clamp-2 leading-relaxed">
                    {guide.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-violet-400">
                  <span>Explore tool</span>
                  <ChevronRight size={13} className="transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-6 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-white/[0.06] pb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Frequently Asked Questions</h2>
            <p className="mt-1 text-xs text-white/50">Everything you need to know about models, limits, and integrations.</p>
          </div>
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All" },
              { id: "getting-started", label: "Getting Started" },
              { id: "image-studio", label: "Images" },
              { id: "publishing", label: "Publishing" },
              { id: "campaigns", label: "Campaigns" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  activeCategory === cat.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-white/[0.04] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="mt-5 divide-y divide-white/[0.06]">
          {filteredFaqs.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40">
              No questions found matching &ldquo;{searchQuery}&rdquo;. Try another search term or contact support below.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="py-4 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-4 text-left text-xs font-semibold text-white hover:text-violet-300 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={16}
                      className={`text-white/40 shrink-0 transition-transform ${isOpen ? "rotate-180 text-violet-400" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-xs leading-relaxed text-white/60 pr-8">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts & Support Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Shortcuts */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
              <Keyboard size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-white/40">Speed up your content creation rhythm.</p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-white/[0.04]">
            {keyboardShortcuts.map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-white/60">{item.action}</span>
                <kbd className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-mono font-semibold text-white/90">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/80 p-6 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Need Personal Help?</h3>
              <p className="text-[11px] text-white/40">Send a question directly to our product engineering team.</p>
            </div>
          </div>

          {supportSent ? (
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 mb-2">
                <Check size={16} />
              </div>
              <p className="text-xs font-semibold text-emerald-300">Message sent successfully!</p>
              <p className="mt-1 text-[11px] text-white/50">Our team will respond to your account email shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSendSupport} className="mt-4 space-y-3">
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your issue or feature request..."
                rows={3}
                required
                className="w-full rounded-xl border border-white/10 bg-[#16162a] p-3 text-xs text-white placeholder:text-white/40 outline-none focus:border-violet-500 resize-none"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500"
              >
                <Send size={13} /> Send Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
