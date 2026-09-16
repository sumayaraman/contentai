"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Film,
  Lightbulb,
  Calendar,
  BarChart3,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface Message {
  role: "user" | "ai";
  text: string;
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
        { role: "ai", text: data.reply ?? "I'm ready to help with your content strategy." },
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
      label: "✨ Create a post",
      desc: "Go to Create Studio",
      action: () => {
        setIsOpen(false);
        router.push("/create");
      },
    },
    {
      label: "🎨 Create an image",
      desc: "Open Visual Studio",
      action: () => {
        setIsOpen(false);
        router.push("/image-studio");
      },
    },
    {
      label: "🎬 Create a video",
      desc: "Video Studio preview",
      action: () => {
        setIsOpen(false);
        router.push("/image-studio");
      },
    },
    {
      label: "💡 Give me content ideas",
      desc: "Brainstorm 5 concepts",
      action: () => sendMessage("Give me 5 viral content ideas for my social media this week."),
    },
    {
      label: "📅 Plan my content",
      desc: "30-Day Workshop",
      action: () => {
        setIsOpen(false);
        router.push("/workspace");
      },
    },
    {
      label: "📊 Explain my analytics",
      desc: "View performance",
      action: () => {
        setIsOpen(false);
        router.push("/analytics");
      },
    },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 py-3 text-white shadow-xl shadow-violet-600/35 transition-all duration-200 hover:scale-105 hover:shadow-violet-600/50 active:scale-95"
        >
          <div className="relative flex items-center justify-center">
            <Bot size={18} />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide">Ask AI Assistant</span>
        </button>
      )}

      {/* Slide-over / Modal Assistant Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col border border-white/10 bg-[#0c0c16]/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 ${
            isExpanded
              ? "bottom-4 right-4 top-4 left-4 sm:left-auto sm:w-[600px] rounded-2xl"
              : "bottom-6 right-6 h-[560px] w-[92vw] max-w-[400px] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
                <Bot size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">ContentAI Assistant</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10.5px] text-white/40">Always active · Ready to guide</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white transition"
                aria-label={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white transition"
                aria-label="Close Assistant"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Welcome Banner */}
            <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-violet-300 font-semibold text-xs">
                <span>👋 Hi! I&apos;m your ContentAI Assistant.</span>
              </div>
              <p className="text-[11.5px] text-white/70 leading-relaxed">
                I can help you create social copy, plan multi-day visual content, or navigate your tools.
              </p>
            </div>

            {/* Quick Actions if no chat started or user wants quick access */}
            {messages.length === 0 && (
              <div className="space-y-2">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/40">
                  Quick Actions:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((qa, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={qa.action}
                      className="flex flex-col items-start rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition hover:border-violet-500/30 hover:bg-violet-500/[0.06] group"
                    >
                      <span className="font-semibold text-white/90 group-hover:text-violet-300 transition text-[11px]">
                        {qa.label}
                      </span>
                      <span className="text-[10px] text-white/40 mt-0.5">{qa.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-violet-600/20"
                      : "bg-[#16162a] border border-white/[0.08] text-white/90 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="mt-1 text-[9.5px] text-white/30 px-1">
                  {m.role === "user" ? "You" : "ContentAI Assistant"}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-violet-400 text-xs py-2">
                <Loader2 size={13} className="animate-spin" />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips when in conversation */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-t border-white/[0.04]">
              {quickActions.slice(0, 3).map((qa, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={qa.action}
                  className="whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10.5px] text-white/60 hover:text-white hover:border-violet-500/40 transition"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="border-t border-white/[0.08] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask assistant anything..."
                className="flex-1 rounded-xl border border-white/10 bg-[#16162a] px-3 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/25 hover:bg-violet-500 transition disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
