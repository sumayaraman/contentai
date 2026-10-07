"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

if (typeof window !== "undefined") {
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
  } catch {
    try {
      localStorage.clear();
    } catch {}
  }
}

const prompts = [
  { icon: "🔥", title: "Viral Hooks", desc: "Give me 5 viral hooks for an AI productivity app on LinkedIn." },
  { icon: "🚀", title: "7-Day Campaign", desc: "Create a 7-day content schedule for a SaaS product launch." },
  { icon: "🎬", title: "Reel Storyboard", desc: "Write a 30-second Instagram Reel script explaining content repurposing." },
  { icon: "📈", title: "Content Score Boost", desc: "How can I improve my post readability and engagement score to 95+?" },
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm your ContentAI Assistant. I can help you brainstorm hooks, generate captions, create campaigns, or plan your content calendar. What are you working on today?",
    time: "10:30 AM",
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [activeChat, setActiveChat] = useState("Viral Social Media Hooks");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
      } catch {
        try {
          localStorage.clear();
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleNewChat() {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Starting a new conversation! What topic or campaign would you like to explore?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setActiveChat("New Conversation");
  }

  async function handleSend(text?: string) {
    const toSend = text || input;
    if (!toSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: toSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: toSend }),
      });
      const data = await res.json();
      const reply = data.reply || "I'm your ContentAI Assistant! Ready to help you create and schedule content.";

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "Here is a high-impact social tip: focus on 1 strong hook, clean 2-line spacing, and 1 direct CTA to maximize engagement!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-140px)] bg-[#0A0A0F] rounded-[24px] border border-white/[0.06] overflow-hidden shadow-2xl">
      {/* SIDEBAR - Clean */}
      <div className="w-full md:w-64 border-r border-white/[0.06] bg-[#10101A] flex flex-col p-4 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-sm flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-xs">
              🤖
            </span>
            AI Assistant
          </h2>
          <button
            type="button"
            onClick={handleNewChat}
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white/60 text-sm transition"
            title="New Chat"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleNewChat}
          className="w-full h-10 rounded-full bg-[#8B5CF6] text-white text-xs font-medium hover:bg-[#7C3AED] transition mb-6 shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
        >
          + New Conversation
        </button>

        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-widest text-white/30 uppercase mb-3 px-2">
            Recent Chats
          </p>
          <div
            onClick={() => setActiveChat("Viral Social Media Hooks")}
            className={`p-2.5 rounded-xl cursor-pointer transition ${
              activeChat === "Viral Social Media Hooks"
                ? "bg-white/[0.06] border border-white/[0.06]"
                : "hover:bg-white/[0.04]"
            }`}
          >
            <p className={`text-xs ${activeChat === "Viral Social Media Hooks" ? "text-white/90 font-medium" : "text-white/50"}`}>
              Viral Social Media Hooks
            </p>
          </div>
          <div
            onClick={() => setActiveChat("7-Day Campaign Strategy")}
            className={`p-2.5 rounded-xl cursor-pointer transition ${
              activeChat === "7-Day Campaign Strategy"
                ? "bg-white/[0.06] border border-white/[0.06]"
                : "hover:bg-white/[0.04]"
            }`}
          >
            <p className={`text-xs ${activeChat === "7-Day Campaign Strategy" ? "text-white/90 font-medium" : "text-white/50"}`}>
              7-Day Campaign Strategy
            </p>
          </div>
          <div
            onClick={() => setActiveChat("Instagram Reel Concepts")}
            className={`p-2.5 rounded-xl cursor-pointer transition ${
              activeChat === "Instagram Reel Concepts"
                ? "bg-white/[0.06] border border-white/[0.06]"
                : "hover:bg-white/[0.04]"
            }`}
          >
            <p className={`text-xs ${activeChat === "Instagram Reel Concepts" ? "text-white/90 font-medium" : "text-white/50"}`}>
              Instagram Reel Concepts
            </p>
          </div>
        </div>

        <div className="mt-auto pt-6 flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Ready •{" "}
          <Link href="/dashboard" className="hover:text-white/70 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* MAIN CHAT - Centered */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-white/[0.06] flex items-center px-6 gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-sm">
            🤖
          </div>
          <div>
            <p className="text-white text-sm font-semibold flex items-center">
              ContentAI Assistant
              <span className="text-white/40 font-normal text-xs ml-2 px-1.5 py-0.5 rounded bg-white/[0.08]">
                GPT-4 / Groq
              </span>
            </p>
            <p className="text-white/40 text-xs">Social Strategy &amp; Copywriting Partner</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center px-4 sm:px-6 py-8">
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-xl mb-4 shadow-lg">
                🤖
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                How can I assist your content today?
              </h1>
              <p className="text-xs sm:text-sm text-white/40 mt-2 max-w-md mx-auto leading-relaxed">
                Generate high-converting hooks, structure multi-day campaigns, or ask questions about managing your social channels.
              </p>
            </div>

            {/* Prompt Cards - 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {prompts.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => handleSend(p.desc)}
                  className="text-left p-4 rounded-2xl bg-[#18181F] border border-white/[0.06] hover:bg-[#1F1F2B] hover:border-white/[0.1] transition group"
                >
                  <p className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                    <span>{p.icon}</span> {p.title}
                  </p>
                  <p className="text-xs text-white/45 mt-1.5 leading-snug line-clamp-2 group-hover:text-white/60">
                    {p.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Message Thread */}
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 p-4 rounded-2xl border ${
                    m.role === "user"
                      ? "bg-[#8B5CF6]/15 border-[#8B5CF6]/30 ml-auto max-w-xl"
                      : "bg-[#18181F] border-white/[0.06] mr-auto max-w-xl"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      m.role === "user"
                        ? "bg-[#8B5CF6] text-white"
                        : "bg-white/[0.08] text-white"
                    }`}
                  >
                    {m.role === "user" ? "You" : "🤖"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </p>
                    <p className="text-[10px] text-white/30 mt-2">{m.time}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 p-4 rounded-2xl bg-[#18181F] border border-white/[0.06] max-w-xl animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex-shrink-0 flex items-center justify-center text-xs">
                    🤖
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-ping" />
                    Thinking &amp; formulating strategy...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/[0.06] bg-[#0A0A0F] shrink-0">
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything (e.g., 'Write 3 hooks for my launch')..."
              className="w-full h-12 rounded-full bg-[#18181F] border border-white/[0.08] pl-5 pr-28 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6]/50 focus:bg-[#1F1F2B] transition"
            />
            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => handleSend()}
              className="absolute right-1.5 top-1.5 h-9 px-5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              Send
            </button>
            <p className="text-[11px] text-white/25 text-center mt-2.5">
              ContentAI Assistant can generate copy, schedule campaigns, and explain all studio features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
