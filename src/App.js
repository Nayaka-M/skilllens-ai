import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// This points to your local Ollama server
const OLLAMA_URL = "http://localhost:11434/api/generate";

export default function App() {
  const [view, setView] = useState('auth'); 
  const [user, setUser] = useState({ name: 'Explorer', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Phi3' });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = { role: 'user', text: input };
    const currentMsgs = [...messages, userMsg];
    setMessages(currentMsgs);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "phi3", // Using your local model
          prompt: input,
          stream: false
        })
      });

      const data = await res.json();
      
      if (data.response) {
        setMessages([...currentMsgs, { role: 'ai', text: data.response }]);
      } else {
        setMessages([...currentMsgs, { role: 'ai', text: "❌ Ollama error: Check if 'phi3' is running." }]);
      }
    } catch (err) {
      setMessages([...currentMsgs, { role: 'ai', text: "❌ Connection Failed. Is Ollama running with OLLAMA_ORIGINS='*'?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (view === 'auth') return (
    <div className="mesh-bg" style={s.center}>
      <div className="glass-panel" style={s.authCard}>
        <div style={s.logoCircle}>Φ</div>
        <h1>SkillLens<span style={{color:'#6366f1'}}>.local</span></h1>
        <p style={s.subtitle}>LOCAL INTELLIGENCE NODE</p>
        <button className="neon-btn" style={s.mainBtn} onClick={() => setView('home')}>
          START LOCAL SESSION
        </button>
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      <aside className="glass-panel" style={s.side}>
        <div style={s.logoSmall}>Φ</div>
        <button style={s.newBtn} onClick={() => setMessages([])}>+ NEW SESSION</button>
        <div style={s.sideProfile}>
          <img src={user.avatar} style={s.avSmall} alt="av" />
          <p style={{fontSize:'11px', fontWeight:'800', margin:0}}>Local User</p>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.chat} ref={scrollRef}>
          {messages.length === 0 && <div style={s.empty}>Ollama Node: Phi-3 Active.</div>}
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? "user-bubble" : "ai-bubble"}>{m.text}</div>
          ))}
          {isTyping && <div className="ai-bubble" style={{opacity:0.4}}>Searching local weights...</div>}
        </div>
        <div className="glass-panel" style={s.dock}>
          <input style={s.dockInput} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type to chat with Phi-3..." />
          <button className="neon-btn" style={s.send} onClick={handleSend}>↑</button>
        </div>
      </main>
    </div>
  );
}

const s = {
  app: { display: 'flex', height: '100vh', background:'#05070a' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width:'100%' },
  authCard: { width: '360px', padding: '40px', borderRadius: '30px', textAlign: 'center' },
  logoCircle: { background:'#6366f1', width:'55px', height:'55px', borderRadius:'50%', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'900' },
  subtitle: { fontSize:'9px', fontWeight:'800', color:'#475569', marginBottom:'25px', letterSpacing:'1.5px' },
  mainBtn: { width:'100%', padding:'15px', marginTop:'5px', cursor: 'pointer' },
  side: { width: '250px', display: 'flex', flexDirection: 'column', padding: '20px' },
  logoSmall: { background:'#6366f1', width:'35px', height:'35px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', marginBottom:'30px' },
  newBtn: { width:'100%', padding:'10px', border:'1px dashed #334155', background:'none', color:'#fff', borderRadius:'10px', fontSize:'11px', fontWeight:'800', cursor:'pointer', marginBottom:'20px' },
  sideProfile: { display:'flex', alignItems:'center', gap:'10px', padding:'12px 5px', borderTop:'1px solid #1e293b', marginTop:'auto' },
  avSmall: { width:'32px', height:'32px', borderRadius:'8px', objectFit:'cover', background:'#0f172a' },
  main: { flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' },
  chat: { flex: 1, padding: '40px 15%', overflowY: 'auto', display:'flex', flexDirection:'column' },
  empty: { margin:'auto', color:'#1e293b', fontWeight:'900', fontSize:'11px', letterSpacing:'2px' },
  dock: { position: 'absolute', bottom: '30px', left: '15%', right: '15%', padding: '10px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' },
  dockInput: { flex: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '14px' },
  send: { width: '40px', height: '40px', cursor: 'pointer' }
};