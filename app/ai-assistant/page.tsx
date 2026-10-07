"use client"
import { useEffect } from "react"

export default function Page() {
  useEffect(() => {
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {}
  }, [])

  return (
    <div style={{display:'flex', height:'100vh', width:'100vw', background:'#07070B', color:'white', fontFamily:'Inter, system-ui, sans-serif', overflow:'hidden'}}>
      {/* SIDEBAR */}
      <div style={{width:300, background:'#111119', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', flexShrink:0}}>
        <div style={{height:64, padding:'0 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}><div style={{width:32, height:32, borderRadius:999, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center'}}>🤖</div><b style={{fontSize:14}}>AI Assistant</b></div>
          <div style={{width:28, height:28, borderRadius:999, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>+</div>
        </div>
        <div style={{padding:16}}>
          <button style={{width:'100%', height:44, borderRadius:999, background:'white', color:'black', fontWeight:600, fontSize:13, border:'none', cursor:'pointer'}}>+ New Conversation</button>
        </div>
        <div style={{flex:1, padding:'0 12px', overflowY:'auto'}}>
          <div style={{fontSize:11, letterSpacing:'0.1em', color:'rgba(255,255,255,0.25)', fontWeight:600, padding:'0 12px', marginBottom:10}}>RECENT CHATS</div>
          <div style={{padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.07)', fontSize:13}}>Viral Social Media Hooks</div>
          <div style={{padding:'10px 12px', borderRadius:12, fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4, cursor:'pointer'}}>7-Day Campaign Strategy</div>
          <div style={{padding:'10px 12px', borderRadius:12, fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:4, cursor:'pointer'}}>Instagram Reel Concepts</div>
        </div>
        <div style={{padding:16, borderTop:'1px solid rgba(255,255,255,0.06)', fontSize:12, color:'rgba(255,255,255,0.3)'}}>● Ready • <a href="/dashboard" style={{color:'rgba(255,255,255,0.5)', textDecoration:'none'}}>Back to Dashboard</a></div>
      </div>

      {/* MAIN */}
      <div style={{flex:1, display:'flex', flexDirection:'column', background:'#0A0A0F', minWidth:0}}>
        <div style={{height:64, borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'0 32px', display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
          <div style={{width:36, height:36, borderRadius:999, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center'}}>🤖</div>
          <div><div style={{fontWeight:600, fontSize:14, display:'flex', alignItems:'center', gap:8}}>ContentAI Assistant <span style={{fontSize:10, background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:4, color:'rgba(255,255,255,0.5)'}}>GPT-4 / Groq</span></div><div style={{fontSize:12, color:'rgba(255,255,255,0.4)'}}>Social Strategy & Copywriting Partner</div></div>
        </div>

        <div style={{flex:1, overflowY:'auto', display:'flex', justifyContent:'center'}}>
          <div style={{width:'100%', maxWidth:720, padding:'60px 32px', boxSizing:'border-box'}}>
            <div style={{textAlign:'center', marginBottom:40}}>
              <div style={{width:56, height:56, margin:'0 auto 20px', borderRadius:16, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24}}>🤖</div>
              <h1 style={{fontSize:30, fontWeight:700, margin:0}}>How can I assist your content today?</h1>
              <p style={{fontSize:14, color:'rgba(255,255,255,0.4)', marginTop:12, lineHeight:1.5}}>Generate high-converting hooks, structure multi-day campaigns, or ask questions about managing your social channels.</p>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:32}}>
              <div style={{padding:16, borderRadius:16, background:'#18181F', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer'}}><div style={{fontSize:13, fontWeight:600}}>🔥 Viral Hooks</div><div style={{fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6, lineHeight:1.4}}>Give me 5 viral hooks for an AI productivity app on LinkedIn.</div></div>
              <div style={{padding:16, borderRadius:16, background:'#18181F', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer'}}><div style={{fontSize:13, fontWeight:600}}>📅 7-Day Campaign</div><div style={{fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6, lineHeight:1.4}}>Create a 7-day content schedule for a SaaS product launch.</div></div>
              <div style={{padding:16, borderRadius:16, background:'#18181F', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer'}}><div style={{fontSize:13, fontWeight:600}}>🎬 Reel Storyboard</div><div style={{fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6, lineHeight:1.4}}>Write a 30-second Instagram Reel script explaining content repurposing.</div></div>
              <div style={{padding:16, borderRadius:16, background:'#18181F', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer'}}><div style={{fontSize:13, fontWeight:600}}>📈 Content Score Boost</div><div style={{fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6, lineHeight:1.4}}>How can I improve my post readability and engagement score to 95+?</div></div>
            </div>

            <div style={{display:'flex', gap:12, padding:16, borderRadius:16, background:'#18181F', border:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{width:32, height:32, borderRadius:999, background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>🤖</div>
              <div style={{fontSize:14, lineHeight:1.6, color:'rgba(255,255,255,0.8)'}}>Hello! I'm your ContentAI Assistant. I can help you brainstorm hooks, generate captions, create campaigns, or plan your content calendar. What are you working on today? <div style={{fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:8}}>10:30 AM</div></div>
            </div>
          </div>
        </div>

        <div style={{padding:20, borderTop:'1px solid rgba(255,255,255,0.06)', background:'#0A0A0F', flexShrink:0}}>
          <div style={{maxWidth:720, margin:'0 auto', position:'relative'}}>
            <input placeholder="Ask anything (e.g., 'Write 3 hooks for my launch')..." style={{width:'100%', height:54, borderRadius:999, background:'#18181F', border:'1px solid rgba(255,255,255,0.08)', padding:'0 110px 0 24px', color:'white', fontSize:13, outline:'none', boxSizing:'border-box'}} />
            <button style={{position:'absolute', right:7, top:7, height:40, padding:'0 24px', borderRadius:999, background:'white', color:'black', fontWeight:600, fontSize:13, border:'none', cursor:'pointer'}}>Send</button>
          </div>
          <div style={{fontSize:11, color:'rgba(255,255,255,0.2)', textAlign:'center', marginTop:10}}>ContentAI Assistant can generate copy, schedule campaigns, and explain all studio features.</div>
        </div>
      </div>
    </div>
  )
}
