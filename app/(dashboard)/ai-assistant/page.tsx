"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, Sparkles, Plus, MessageSquare, Trash2, ArrowLeft,
  Loader2, Zap, Copy, Check, RefreshCw
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

const DEFAULT_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "Viral Social Media Hooks",
    date: "Today",
    messages: [
      {
        id: "m-1",
        role: "assistant",
        content: "Hello! I'm your ContentAI Assistant. I can help you brainstorm hooks, generate captions, create campaigns, or plan your content calendar. What are you working on today?",
        timestamp: "10:30 AM",
      },
    ],
  },
  {
    id: "session-2",
    title: "7-Day Campaign Strategy",
    date: "Yesterday",
    messages: [
      {
        id: "m-2",
        role: "assistant",
        content: "Ready to build a multi-day marketing campaign. Tell me your product or goal and I'll structure the launch schedule!",
        timestamp: "Yesterday",
      },
    ],
  },
  {
    id: "session-3",
    title: "Instagram Reel Concepts",
    date: "3 days ago",
    messages: [
      {
        id: "m-3",
        role: "assistant",
        content: "Let's brainstorm 30-second short-form video hooks designed for TikTok and Instagram Reels.",
        timestamp: "3 days ago",
      },
    ],
  },
];

const PROMPT_SUGGESTIONS = [
  {
    title: "Viral Hooks",
    prompt: "Give me 5 viral hooks for an AI productivity app on LinkedIn.",
    icon: "🔥",
  },
  {
    title: "7-Day Campaign",
    prompt: "Create a 7-day content schedule for a SaaS product launch.",
    icon: "🚀",
  },
  {
    title: "Reel Storyboard",
    prompt: "Write a 30-second Instagram Reel script explaining content repurposing.",
    icon: "🎬",
  },
  {
    title: "Content Score Boost",
    prompt: "How can I improve my post readability and engagement score to 95+?",
    icon: "📈",
  },
];

export default function AIAssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(DEFAULT_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession.messages, loading]);

  function handleNewChat() {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: "New Conversation",
      date: "Just now",
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "Hello! I'm your ContentAI Assistant. What would you like to create or explore today?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setMobileSidebarOpen(false);
  }

  function handleDeleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (sessions.length <= 1) return;
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  }

  async function handleSend(promptText?: string) {
    const textToSend = promptText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update session messages & auto-set title if first prompt
    const updatedMessages = [...activeSession.messages, userMessage];
    const updatedTitle =
      activeSession.messages.length <= 1
        ? textToSend.slice(0, 28) + (textToSend.length > 28 ? "..." : "")
        : activeSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, title: updatedTitle, messages: updatedMessages }
          : s
      )
    );

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I could not generate a response.";

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, messages: [...updatedMessages, assistantMessage] }
            : s
        )
      );
    } catch {
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "I'm your ContentAI Assistant! I can help you craft viral hooks, schedule posts, generate campaigns, or optimize your content score. Try asking about our studios!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, messages: [...updatedMessages, errorMessage] }
            : s
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="flex h-[calc(100vh-120px)] w-full rounded-[24px] overflow-hidden border border-white/[0.08] bg-[#0E0E14] shadow-2xl">
      {/* ═══════════════════════════════════════════════════
          LEFT SIDEBAR: CHAT HISTORY (ChatGPT STYLE)
      ═══════════════════════════════════════════════════ */}
      <aside
        className={`w-72 bg-[#12121A] border-r border-white/[0.06] flex flex-col justify-between p-4 transition-all duration-300 ${
          mobileSidebarOpen ? "fixed inset-y-0 left-0 z-50 flex shadow-2xl" : "hidden md:flex"
        }`}
      >
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Top Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-sm shadow-md">
                🤖
              </div>
              <span className="font-bold text-sm text-white tracking-tight">AI Assistant</span>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition"
              title="Start New Chat"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-xs font-semibold transition"
          >
            <Plus size={14} className="text-[#8B5CF6]" />
            <span>New Conversation</span>
          </button>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar pr-1">
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-2 pt-2">
              Recent Chats
            </div>
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setMobileSidebarOpen(false);
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition text-xs ${
                  session.id === activeSession.id
                    ? "bg-[#8B5CF6]/15 text-white border border-[#8B5CF6]/30 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare size={14} className="text-[#8B5CF6]/70 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </div>
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 p-1 transition"
                    title="Delete chat"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
          <Link href="/dashboard" className="hover:text-white transition flex items-center gap-1.5">
            <ArrowLeft size={12} /> Back to Dashboard
          </Link>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
          </span>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════
          MAIN CHAT AREA (ChatGPT INTERFACE)
      ═══════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col bg-[#0A0A0F] relative overflow-hidden">
        {/* Chat Header */}
        <header className="h-16 border-b border-white/[0.06] bg-[#0E0E14]/80 backdrop-blur px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-white/[0.05] text-white/70"
            >
              <MessageSquare size={16} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-sm shadow-md">
                🤖
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>ContentAI Assistant</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 font-semibold">
                    GPT-4 / Groq
                  </span>
                </h1>
                <p className="text-[11px] text-white/40">Social Strategy &amp; Copywriting Partner</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="btn btn-ghost btn-sm text-xs text-white/70 hover:text-white"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </header>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* If only welcome message, show prompt suggestion cards */}
          {activeSession.messages.length <= 1 && (
            <div className="max-w-2xl mx-auto pt-6 pb-2 text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 border border-[#8B5CF6]/30 text-2xl mb-1 shadow-lg">
                🤖
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                How can I assist your content today?
              </h2>
              <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto leading-relaxed">
                Generate high-converting hooks, structure multi-day campaigns, or ask questions about managing your social channels.
              </p>

              {/* Suggestion Chips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left">
                {PROMPT_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.title}
                    type="button"
                    onClick={() => handleSend(sug.prompt)}
                    className="p-3.5 rounded-2xl bg-[#14141E] hover:bg-[#1A1A28] border border-white/[0.06] hover:border-[#8B5CF6]/30 transition group text-left"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
                      <span>{sug.icon}</span>
                      <span>{sug.title}</span>
                    </div>
                    <p className="text-[11.5px] text-white/50 group-hover:text-white/80 transition line-clamp-2 leading-relaxed">
                      {sug.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Messages */}
          {activeSession.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 shadow-md ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white font-bold text-xs"
                    : "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white"
                }`}
              >
                {msg.role === "user" ? "You" : "🤖"}
              </div>

              {/* Message Box */}
              <div
                className={`group relative rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-[#8B5CF6] text-white rounded-tr-none shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
                    : "bg-[#161622] text-white/90 rounded-tl-none border border-white/[0.08]"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Footer time & copy */}
                <div
                  className={`flex items-center gap-2 mt-2 pt-1.5 text-[10px] ${
                    msg.role === "user" ? "text-white/60 justify-end" : "text-white/40 justify-between border-t border-white/[0.05]"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === "assistant" && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-white flex items-center gap-1 transition"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 mr-auto max-w-3xl animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-[#161622] border border-white/[0.08] rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-white/60">
                <Loader2 size={13} className="animate-spin text-[#8B5CF6]" />
                <span>Thinking &amp; generating insights...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 sm:p-5 border-t border-white/[0.06] bg-[#0E0E14]/90 backdrop-blur">
          <div className="max-w-3xl mx-auto relative flex items-center">
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
              className="w-full bg-[#161622] text-white text-xs sm:text-[13px] rounded-full pl-5 pr-24 py-3.5 border border-white/[0.1] focus:border-[#8B5CF6] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] shadow-inner"
            />
            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => handleSend()}
              className="absolute right-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_16px_rgba(139,92,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] transition"
            >
              <span>Send</span>
              <Send size={12} />
            </button>
          </div>
          <div className="text-[10.5px] text-center text-white/35 mt-2">
            ContentAI Assistant can generate copy, schedule campaigns, and explain all studio features.
          </div>
        </div>
      </main>
    </div>
  );
}
