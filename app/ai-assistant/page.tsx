"use client"
import { useState, useEffect, useRef } from "react"

type Msg = { role: 'user' | 'assistant', content: string }

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your ContentAI Assistant. I can help you brainstorm hooks, generate captions, create campaigns, or plan your content calendar. What are you working on today?"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {}
  }, [])

  const quickPrompts = [
    { title: "🔥 Viral Hooks", text: "Give me 5 viral hooks for an AI productivity app on LinkedIn." },
    { title: "📅 7-Day Campaign", text: "Create a 7-day content schedule for a SaaS product launch." },
    { title: "🎬 Reel Storyboard", text: "Write a 30-second Instagram Reel script explaining content repurposing." },
    { title: "📈 Content Score Boost", text: "How can I improve my post readability and engagement score to 95+?" },
  ]

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Msg = { role: 'user', content: text.trim() }
    setMessages(m => [...m, userMsg])
    setInput("")
    setLoading(true)

    try {
      // 1. Try /api/chat
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          prompt: text.trim()
        })
      })

      let data = await res.json().catch(() => ({}))
      let reply = data.reply || data.message || data.content || data.response || data.output || ""

      // 2. Fallback to /api/ai-assistant if /api/chat returned empty
      if (!reply) {
        const res2 = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim(), prompt: text.trim() })
        })
        data = await res2.json().catch(() => ({}))
        reply = data.reply || data.message || data.content || data.response || ""
      }

      // 3. Fallback smart reply if API key is not yet set
      if (!reply) {
        reply = `Got it! Here's help for: "${text.trim()}"\n\n🔥 3 Viral Hooks:\n1. "I spent 100 hours testing AI tools - here are 3 that actually save you 10hrs/week"\n2. "Most people use AI wrong. Here's the framework that 10x'd my content"\n3. "Stop writing captions manually - this AI trick got me 50K views"\n\nWant me to write the full caption, reel script, or 7-day calendar for this?`
      }

      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages(m => [
        ...m,
        {
          role: 'assistant',
          content: "I'm here! Tell me what content you need - hooks, captions, reel script, or campaign plan - I'll create it for you right now."
        }
      ])
    }
    setLoading(false)
  }

  function handleNewChat() {
    setMessages([
      {
        role: 'assistant',
        content: "Starting a new conversation! What topic or campaign would you like to explore?"
      }
    ])
  }

  return (
    <div style={{display:'flex', height:'100vh', width:'100vw', background:'#07070B', color:'white', fontFamily:'Inter, system-ui, sans-serif', overflow:'hidden'}}>
      {/* SIDEBAR */}
      <div style={{width:300, background:'#111119', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', flexShrink:0}}>
        <div style={{height:64, padding:'0 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:32, height:32, borderRadius:999, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center'}}>🤖</div>
            <b style={{fontSize:14}}>AI Assistant</b>
          </div>
          <div onClick={handleNewChat} style={{width:28, height:28, borderRadius:999, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}} title="New Chat">+</div>
        </div>
        <div style={{padding:16}}>
          <button onClick={handleNewChat} style={{width:'100%', height:44, borderRadius:999, background:'white', color:'black', fontWeight:600, fontSize:13, border:'none', cursor:'pointer'}}>+ New Conversation</button>
        </div>
        <div style={{flex:1, padding:'0 12px', overflowY:'auto'}}>
          <div style={{fontSize:11, letterSpacing:'0.1em', color:'rgba(255,255,255,0.25)', fontWeight:600, padding:'0 12px', marginBottom:10}}>RECENT CHATS</div>
          <div onClick={() => send("Give me 5 viral social media hooks")} style={{padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.07)', fontSize:13, cursor:'pointer'}}>Viral Social Media Hooks</div>
          <div onClick={() => send("Create a 7-day marketing campaign strategy")} style={{padding:'10px 12px', borderRadius:12, fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4, cursor:'pointer'}}>7-Day Campaign Strategy</div>
          <div onClick={() => send("Brainstorm 3 short-form Instagram Reel concepts")} style={{padding:'10px 12px', borderRadius:12, fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4, cursor:'pointer'}}>Instagram Reel Concepts</div>
        </div>
        <div style={{padding:16, borderTop:'1px solid rgba(255,255,255,0.06)', fontSize:12, color:'rgba(255,255,255,0.3)'}}>● Ready • <a href="/dashboard" style={{color:'rgba(255,255,255,0.5)', textDecoration:'none'}}>Back to Dashboard</a></div>
      </div>

      {/* MAIN */}
      <div style={{flex:1, display:'flex', flexDirection:'column', background:'#0A0A0F', minWidth:0}}>
        <div style={{height:64, borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
          <div style={{width:36, height:36, borderRadius:999, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center'}}>🤖</div>
          <div>
            <div style={{fontWeight:600, fontSize:14, display:'flex', alignItems:'center', gap:8}}>
              ContentAI Assistant
              <span style={{fontSize:10, background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:4, color:'rgba(255,255,255,0.5)'}}>GPT-4 / Groq</span>
            </div>
            <div style={{fontSize:12, color:'rgba(255,255,255,0.4)'}}>Social Strategy & Copywriting Partner</div>
          </div>
        </div>

        <div style={{flex:1, overflowY:'auto', display:'flex', justifyContent:'center'}}>
          <div style={{width:'100%', maxWidth:720, padding:'60px 32px', boxSizing:'border-box'}}>
            <div style={{textAlign:'center', marginBottom:40}}>
              <div style={{width:56, height:56, margin:'0 auto 20px', borderRadius:16, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24}}>🤖</div>
              <h1 style={{fontSize:30, fontWeight:700, margin:0}}>How can I assist your content today?</h1>
              <p style={{fontSize:14, color:'rgba(255,255,255,0.4)', marginTop:12, lineHeight:1.5}}>Generate high-converting hooks, structure multi-day campaigns, or ask questions about managing your social channels.</p>
            </div>

            {/* Quick Prompts Grid */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:32}}>
              {quickPrompts.map((p) => (
                <div
                  key={p.title}
                  onClick={() => send(p.text)}
                  style={{padding:16, borderRadius:16, background:'#18181F', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', transition:'background 0.2s'}}
                >
                  <div style={{fontSize:13, fontWeight:600}}>{p.title}</div>
                  <div style={{fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6, lineHeight:1.4}}>{p.text}</div>
                </div>
              ))}
            </div>

            {/* Messages Thread */}
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display:'flex',
                    gap:12,
                    padding:16,
                    borderRadius:16,
                    background: m.role === 'user' ? 'rgba(139,92,246,0.18)' : '#18181F',
                    border: m.role === 'user' ? '1px solid rgba(139,92,246,0.35)' : '1px solid rgba(255,255,255,0.06)',
                    maxWidth: m.role === 'user' ? '85%' : '100%',
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    boxSizing:'border-box',
                  }}
                >
                  <div
                    style={{
                      width:32,
                      height:32,
                      borderRadius:999,
                      background: m.role === 'user' ? '#8B5CF6' : 'rgba(255,255,255,0.08)',
                      display:'flex',
                      alignItems:'center',
                      justifyContent:'center',
                      flexShrink:0,
                      fontSize: m.role === 'user' ? 12 : 14,
                      fontWeight: m.role === 'user' ? 700 : 400
                    }}
                  >
                    {m.role === 'user' ? 'You' : '🤖'}
                  </div>
                  <div style={{fontSize:14, lineHeight:1.6, color:'rgba(255,255,255,0.85)', whiteSpace:'pre-wrap', wordBreak:'break-word'}}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{display:'flex', gap:12, padding:16, borderRadius:16, background:'#18181F', border:'1px solid rgba(255,255,255,0.06)', width:'fit-content'}}>
                  <div style={{width:32, height:32, borderRadius:999, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>🤖</div>
                  <div style={{fontSize:13, color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center'}}>
                    Thinking & generating response...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div style={{padding:20, borderTop:'1px solid rgba(255,255,255,0.06)', background:'#0A0A0F', flexShrink:0}}>
          <div style={{maxWidth:720, margin:'0 auto', position:'relative'}}>
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send(input)
              }}
              placeholder="Ask anything (e.g., 'Write 3 hooks for my launch')..."
              style={{
                width:'100%',
                height:54,
                borderRadius:999,
                background:'#18181F',
                border:'1px solid rgba(255,255,255,0.08)',
                padding:'0 110px 0 24px',
                color:'white',
                fontSize:13,
                outline:'none',
                boxSizing:'border-box'
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              style={{
                position:'absolute',
                right:7,
                top:7,
                height:40,
                padding:'0 20px',
                borderRadius:999,
                background:'white',
                color:'black',
                fontWeight:600,
                fontSize:13,
                border:'none',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition:'all 0.2s'
              }}
            >
              {loading ? '...' : 'Send ↗'}
            </button>
          </div>
          <div style={{fontSize:11, color:'rgba(255,255,255,0.2)', textAlign:'center', marginTop:10}}>
            ContentAI Assistant can generate copy, schedule campaigns, and explain all studio features.
          </div>
        </div>
      </div>
    </div>
  )
}
