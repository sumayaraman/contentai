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
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Search & Direct Support Toolbar Panel */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: "20px 24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ position: "relative", flex: "1 1 340px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, workflows, or FAQs..."
            className="campaign-input"
            style={{
              height: 44,
              paddingLeft: 42,
              paddingRight: searchQuery ? 70 : 16,
              fontSize: 14,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--text-secondary)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-subtle)",
                padding: "3px 8px",
                borderRadius: "var(--r-sm)",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>

        <button
          onClick={handleCopyEmail}
          style={{
            height: 44,
            padding: "0 18px",
            borderRadius: "var(--r-md)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: copiedEmail ? "#4ade80" : "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-accent)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = copiedEmail ? "#4ade80" : "var(--text-secondary)";
          }}
        >
          {copiedEmail ? (
            <>
              <Check size={15} />
              <span>Copied support email!</span>
            </>
          ) : (
            <>
              <Copy size={15} style={{ color: "#a89dff" }} />
              <span>Need direct help? support@contentai.dev</span>
            </>
          )}
        </button>
      </div>

      {/* Feature Guides - Spacious 2-Column Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Feature Guides
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "3px 0 0" }}>
              Quick walkthroughs and direct shortcuts to essential platform tools
            </p>
          </div>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: 9999,
              background: "var(--accent-soft)",
              border: "1px solid var(--border-accent)",
              color: "#a89dff",
            }}
          >
            4 essential workflows
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          {quickGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.title}
                href={guide.href}
                className="campaign-day-card"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 24,
                  minHeight: 180,
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "var(--r-md)",
                        background: "var(--accent-soft)",
                        border: "1px solid var(--border-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#a89dff",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 9999,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid var(--border-subtle)",
                        color: "#a89dff",
                      }}
                    >
                      {guide.tag}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 16.5,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      margin: "0 0 8px",
                    }}
                  >
                    {guide.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {guide.desc}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#a89dff",
                    fontSize: 12.5,
                    fontWeight: 600,
                    marginTop: 20,
                  }}
                >
                  <span>Explore tool</span>
                  <ChevronRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions Section */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: "24px 28px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            paddingBottom: 18,
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-md)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
                flexShrink: 0,
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Frequently Asked Questions
              </h2>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "3px 0 0" }}>
                Everything you need to know about AI models, generation limits, and publishing.
              </p>
            </div>
          </div>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {filteredFaqs.length} {filteredFaqs.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {/* Category filter pills row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { id: "all", label: "All Topics" },
            { id: "getting-started", label: "Getting Started" },
            { id: "image-studio", label: "Image Studio" },
            { id: "publishing", label: "Publishing" },
            { id: "campaigns", label: "Campaigns" },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  borderRadius: "var(--r-md)",
                  padding: "7px 15px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: isActive ? "var(--accent)" : "var(--bg-elevated)",
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  border: isActive ? "1px solid var(--accent)" : "1px solid var(--border)",
                  boxShadow: isActive ? "0 2px 8px rgba(109,92,255,0.35)" : "none",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
          {filteredFaqs.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                fontSize: 13.5,
                color: "var(--text-muted)",
              }}
            >
              No questions found matching &ldquo;{searchQuery}&rdquo;. Try another search term or contact our support team below.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  style={{
                    background: "var(--bg-elevated)",
                    border: isOpen ? "1px solid var(--border-accent)" : "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    padding: "18px 20px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "var(--r-sm)",
                          background: "var(--accent-soft)",
                          border: "1px solid var(--border-accent)",
                          color: "#a89dff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        ?
                      </span>
                      <span
                        style={{
                          fontSize: 14.5,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {faq.question}
                      </span>
                    </div>

                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "var(--r-sm)",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isOpen ? "#a89dff" : "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      <ChevronDown
                        size={15}
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: "1px solid var(--border-subtle)",
                        paddingLeft: 40,
                        paddingRight: 8,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13.5,
                          color: "var(--text-secondary)",
                          lineHeight: 1.65,
                          margin: 0,
                        }}
                      >
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

      {/* 2-Column Bottom Section: Keyboard Shortcuts & Support */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 24,
        }}
      >
        {/* Keyboard Shortcuts Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: "24px 28px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingBottom: 16,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--r-md)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
                flexShrink: 0,
              }}
            >
              <Command size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16.5, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Keyboard Shortcuts
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Speed up your content creation workflow with quick hotkeys.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {keyboardShortcuts.map((item) => (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "var(--r-md)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  {item.action}
                </span>
                <kbd
                  style={{
                    padding: "4px 10px",
                    borderRadius: "var(--r-sm)",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontFamily: "monospace",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-xl)",
            padding: "24px 28px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingBottom: 16,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--r-md)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a89dff",
                flexShrink: 0,
              }}
            >
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16.5, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Need Personal Help?
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Send an inquiry directly to the ContentAI support team.
              </p>
            </div>
          </div>

          {supportSent ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "36px 16px",
                textAlign: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--r-md)",
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#4ade80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={24} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#4ade80", margin: 0 }}>
                Message Received!
              </p>
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--text-secondary)",
                  maxWidth: 280,
                  margin: 0,
                }}
              >
                Thanks for reaching out. A support engineer will review your inquiry shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendSupport} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="campaign-field-label">YOUR MESSAGE</label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={4}
                  placeholder="Describe your question, feature request, or issue in detail..."
                  className="campaign-input"
                  style={{
                    resize: "vertical",
                    lineHeight: 1.6,
                    minHeight: 105,
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  height: 42,
                  width: "100%",
                  borderRadius: "var(--r-md)",
                  background: "var(--accent)",
                  border: "none",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 2px 10px rgba(109,92,255,0.35)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                }}
              >
                <Send size={15} />
                <span>Send Message to Support</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
