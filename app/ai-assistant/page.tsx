"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const prompts = [
  {
    icon: "🔥",
    title: "Viral Hooks",
    desc: "Give me 5 viral hooks for an AI productivity app on LinkedIn.",
  },
  {
    icon: "🚀",
    title: "7-Day Campaign",
    desc: "Create a 7-day content schedule for a SaaS product launch.",
  },
  {
    icon: "🎬",
    title: "Reel Storyboard",
    desc: "Write a 30-second Instagram Reel script explaining content repurposing.",
  },
  {
    icon: "📈",
    title: "Content Score Boost",
    desc: "How can I improve my post readability and engagement score to 95+?",
  },
];

const initialMessages: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I'm your ContentAI Assistant. I can help you brainstorm hooks, generate captions, create campaigns, or plan your content calendar. What are you working on today?",
    time: "10:30 AM",
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState("Viral Social Media Hooks");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleNewChat() {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content:
          "Starting a fresh conversation! What would you like to create or brainstorm?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setActiveChat("New Conversation");
  }

  async function handleSend(text?: string) {
    const toSend = text || input;
    if (!toSend.trim() || loading) return;

    const userMsg: Message = {
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
      const reply = data.reply || "Ready to assist! Tell me more about your content.";

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          "Here is a high-converting formula: 1 irresistible hook, 2 concise value points, and 1 clear Call-To-Action!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#08080C] text-white antialiased">
      {/* SIDEBAR - 300px shrink-0 */}
      <aside className="w-[300px] shrink-0 bg-[#11111A] border-r border-white/[0.06] flex flex-col">
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-md">
              🤖
            </div>
            <span className="font-semibold text-sm">AI Assistant</span>
          </div>
          <button
            type="button"
            onClick={handleNewChat}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center text-sm transition"
            title="New Chat"
          >
            +
          </button>
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full h-11 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition shadow-sm"
          >
            + New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div>
            <p className="text-[11px] tracking-widest font-semibold text-white/25 uppercase px-3 mb-2">
              Recent Chats
            </p>
            <div className="space-y-1">
              <div
                onClick={() => setActiveChat("Viral Social Media Hooks")}
                className={`px-3 py-2.5 rounded-xl text-xs cursor-pointer transition ${
                  activeChat === "Viral Social Media Hooks"
                    ? "bg-white/[0.07] text-white font-medium"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                Viral Social Media Hooks
              </div>
              <div
                onClick={() => setActiveChat("7-Day Campaign Strategy")}
                className={`px-3 py-2.5 rounded-xl text-xs cursor-pointer transition ${
                  activeChat === "7-Day Campaign Strategy"
                    ? "bg-white/[0.07] text-white font-medium"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                7-Day Campaign Strategy
              </div>
              <div
                onClick={() => setActiveChat("Instagram Reel Concepts")}
                className={`px-3 py-2.5 rounded-xl text-xs cursor-pointer transition ${
                  activeChat === "Instagram Reel Concepts"
                    ? "bg-white/[0.07] text-white font-medium"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                Instagram Reel Concepts
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/[0.06] flex items-center gap-2 text-xs text-white/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Ready •{" "}
          <Link href="/dashboard" className="hover:text-white transition">
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0F]">
        {/* Top Header */}
        <div className="h-16 shrink-0 border-b border-white/[0.06] px-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-md">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">ContentAI Assistant</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-medium">
                GPT-4 / Groq
              </span>
            </div>
            <div className="text-xs text-white/40">Social Strategy &amp; Copywriting Partner</div>
          </div>
          <div className="ml-auto">
            <input
              placeholder="Search content..."
              className="h-9 w-64 rounded-full bg-white/[0.06] border border-white/10 px-4 text-xs placeholder:text-white/20 outline-none focus:border-white/20 transition"
            />
          </div>
        </div>

        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[720px] mx-auto px-8 py-16 w-full space-y-8">
            <div className="text-center mb-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl mb-5 shadow-xl">
                🤖
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                How can I assist your content today?
              </h1>
              <p className="text-xs sm:text-sm text-white/40 mt-3 max-w-lg mx-auto leading-relaxed">
                Generate high-converting hooks, structure multi-day campaigns, or ask questions about managing your social channels.
              </p>
            </div>

            {/* 4 Cards Grid - Airy spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-10">
              {prompts.map((p) => (
                <div
                  key={p.title}
                  onClick={() => handleSend(p.desc)}
                  className="p-4 rounded-2xl bg-[#181820] border border-white/[0.06] hover:border-white/10 hover:bg-[#1C1C26] cursor-pointer transition group"
                >
                  <div className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-white">
                    <span>{p.icon}</span> {p.title}
                  </div>
                  <div className="text-xs text-white/40 mt-2 leading-snug group-hover:text-white/60 transition">
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Messages Thread */}
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 items-start p-4 rounded-2xl border transition ${
                    m.role === "user"
                      ? "bg-violet-600/20 border-violet-500/30 ml-auto max-w-xl"
                      : "bg-[#181820] border border-white/[0.06]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.role === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-white/[0.08] text-white"
                    }`}
                  >
                    {m.role === "user" ? "You" : "🤖"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm leading-[1.6] text-white/80 whitespace-pre-wrap">
                      {m.content}
                    </p>
                    <p className="text-[10px] text-white/25 mt-2">{m.time}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-start p-4 rounded-2xl bg-[#181820] border border-white/[0.06] animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0 text-xs">
                    🤖
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40 py-1">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                    Thinking and generating strategy...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="shrink-0 p-4 border-t border-white/[0.06] bg-[#0A0A0F]">
          <div className="max-w-[720px] mx-auto relative">
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything (e.g., 'Write 3 hooks for my launch')..."
              className="w-full h-[56px] rounded-full bg-[#181820] border border-white/10 pl-6 pr-28 text-xs sm:text-sm text-white outline-none focus:border-violet-500/50 placeholder:text-white/25 transition"
            />
            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => handleSend()}
              className="absolute right-2 top-2 h-[40px] px-6 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center shadow-md"
            >
              Send
            </button>
          </div>
          <p className="text-[11px] text-white/20 text-center mt-3">
            ContentAI Assistant can generate copy, schedule campaigns, and explain all studio features.
          </p>
        </div>
      </main>
    </div>
  );
}
