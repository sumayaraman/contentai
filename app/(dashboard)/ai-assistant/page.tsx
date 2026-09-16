"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Film,
  Lightbulb,
  Calendar,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function AIAssistantPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply ?? "I am ready to help you with your content strategy." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please check your network or try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const quickActions = [
    {
      icon: Sparkles,
      title: "Create a post",
      desc: "Turn your ideas into a ready-to-post social media post.",
      link: "/create",
    },
    {
      icon: ImageIcon,
      title: "Create an image",
      desc: "Generate high-res visuals for an individual post.",
      link: "/image-studio",
    },
    {
      icon: Film,
      title: "Create a video",
      desc: "Explore the video studio generation capabilities.",
      link: "/image-studio",
    },
    {
      icon: Lightbulb,
      title: "Give me content ideas",
      desc: "Ask the AI for 5 viral concepts tailored to your brand.",
      action: () => sendMessage("Give me 5 viral content ideas for my social media this week."),
    },
    {
      icon: Calendar,
      title: "Plan my content",
      desc: "Generate a complete 30-day branded content workshop.",
      link: "/workspace",
    },
    {
      icon: BarChart3,
      title: "Explain my analytics",
      desc: "Review your reach, clicks, and engagement scoring.",
      link: "/analytics",
    },
  ];

  return (
    <div className="page animate-fade-up max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-violet-300 mb-2">
            <Bot size={13} /> AI Assistant
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Your Content Co-Pilot
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Ask for content ideas, caption improvements, strategic advice, or quick guidance on using ContentAI.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Always Ready
        </div>
      </div>

      {/* Main Assistant Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c16]/90 backdrop-blur-xl shadow-2xl flex flex-col min-h-[600px] overflow-hidden">
        {/* Welcome Banner */}
        <div className="border-b border-white/[0.06] p-6 bg-gradient-to-r from-violet-600/10 via-transparent to-transparent">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                👋 Hi! I&apos;m your ContentAI Assistant.
              </h2>
              <p className="text-xs text-white/60 mt-1 max-w-xl leading-relaxed">
                I can help you craft engaging posts, plan a full month of visuals, optimize your posting schedule, and find the right tools. Choose a quick action below or ask me anything!
              </p>
            </div>
          </div>
        </div>

        {/* Messages / Canvas Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.length === 0 ? (
            <div className="space-y-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Popular Quick Actions:
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((qa, i) => {
                  const Icon = qa.icon;
                  if (qa.link) {
                    return (
                      <Link
                        key={i}
                        href={qa.link}
                        className="group flex flex-col justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-violet-500/40 hover:bg-violet-500/[0.06] hover:shadow-lg hover:shadow-violet-600/10"
                      >
                        <div className="space-y-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition">
                            <Icon size={16} />
                          </div>
                          <h3 className="text-xs font-semibold text-white group-hover:text-violet-300 transition">
                            {qa.title}
                          </h3>
                          <p className="text-[11px] text-white/50 leading-relaxed">{qa.desc}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Open</span>
                          <ArrowRight size={12} />
                        </div>
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={qa.action}
                      className="group flex flex-col justify-between text-left rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-violet-500/40 hover:bg-violet-500/[0.06] hover:shadow-lg hover:shadow-violet-600/10"
                    >
                      <div className="space-y-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition">
                          <Icon size={16} />
                        </div>
                        <h3 className="text-xs font-semibold text-white group-hover:text-violet-300 transition">
                          {qa.title}
                        </h3>
                        <p className="text-[11px] text-white/50 leading-relaxed">{qa.desc}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Ask AI</span>
                        <ArrowRight size={12} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-violet-600/20"
                        : "bg-[#16162a] border border-white/[0.08] text-white/90 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                  <span className="mt-1 text-[10px] text-white/30 px-1">
                    {m.role === "user" ? "You" : "ContentAI Assistant"}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-violet-400 text-xs py-2">
                  <Loader2 size={15} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/[0.08] p-4 bg-[#0a0a14]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about content creation, campaign ideas, or platform tips..."
              className="flex-1 rounded-xl border border-white/10 bg-[#141426] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-40"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
