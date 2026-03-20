import React, { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const [view, setView] = useState('auth'); 
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState({ 
    name: 'Explorer', email: 'user@skilllens.ai', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SkillLens' 
  });
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('skill_user');
    const savedHistory = localStorage.getItem('skill_history');
    if (savedUser) { setUser(JSON.parse(savedUser)); setView('home'); }
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUser({ ...user, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleVoice = () => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return alert("Voice recognition not supported.");

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new Speech();
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const title = messages[0].text.substring(0, 22) + "...";
      const newHistory = [{ title, chats: messages }, ...history];
      setHistory(newHistory.slice(0, 10));
      localStorage.setItem('skill_history', JSON.stringify(newHistory));
    }
    setMessages([]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "Intelligence node active. Request processed." }]);
      setIsTyping(false);
    }, 1000);
  };

  if (view === 'auth') return (
    <div className="mesh-bg" style={s.center}>
      <div className="glass-panel" style={s.authCard}>
        <div style={s.logoCircle}>S</div>
        <h1>SkillLens<span style={{color:'#6366f1'}}>.ai</span></h1>
        <p style={s.subtitle}>{authMode === 'login' ? 'SECURE LOGIN' : 'CREATE ACCOUNT'}</p>
        {authMode === 'register' && (
          <input style={s.input} placeholder="Full Name" onChange={(e) => setUser({...user, name: e.target.value})} />
        )}
        <input style={s.input} placeholder="Email" onChange={(e) => setUser({...user, email: e.target.value})} />
        <input style={s.input} type="password" placeholder="Password" />
        <button className="neon-btn" style={s.mainBtn} onClick={() => { localStorage.setItem('skill_user', JSON.stringify(user)); setView('home'); }}>
          {authMode === 'login' ? 'LOGIN' : 'REGISTER'}
        </button>
        <p style={s.toggle} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
          {authMode === 'login' ? "Need a node? Sign up" : "Have a node? Log in"}
        </p>
      </div>
    </div>
  );

  if (view === 'profile') return (
    <div className="mesh-bg" style={s.center}>
      <div className="glass-panel" style={s.pCard}>
        <div className="avatar-upload-container" onClick={() => document.getElementById('fileIn').click()}>
          <img src={user.avatar} className="avatar-main" alt="avatar" />
          <div className="avatar-overlay">UPLOAD</div>
        </div>
        <input id="fileIn" type="file" hidden accept="image/*" onChange={handleFileUpload} />
        <h2>Profile Settings</h2>
        <div style={{width:'100%', textAlign:'left'}}>
          <label style={s.label}>FULL NAME</label>
          <input style={s.input} value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} />
          <label style={s.label}>EMAIL</label>
          <input style={s.input} value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} />
        </div>
        <button className="neon-btn" style={s.mainBtn} onClick={() => { localStorage.setItem('skill_user', JSON.stringify(user)); setView('home'); }}>SAVE CHANGES</button>
        <p style={s.logout} onClick={() => { localStorage.clear(); window.location.reload(); }}>LOGOUT</p>
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      <aside className="glass-panel" style={s.side}>
        <div style={s.logoSmall}>S</div>
        <button style={s.newBtn} onClick={startNewChat}>+ NEW CHAT</button>
        <div style={{flex:1, overflowY:'auto'}}>
          {history.map((h, i) => (
            <div key={i} className="history-item" onClick={() => setMessages(h.chats)}>{h.title}</div>
          ))}
        </div>
        <div style={s.sideProfile} onClick={() => setView('profile')}>
          <img src={user.avatar} style={s.avSmall} alt="av" />
          <div style={{overflow:'hidden'}}>
            <p style={{fontSize:'11px', fontWeight:'800', margin:0}}>{user.name}</p>
            <p style={{fontSize:'9px', color:'#6366f1', margin:0}}>Online</p>
          </div>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.chat} ref={scrollRef}>
          {messages.length === 0 && <div style={s.empty}>Ready for commands.</div>}
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? "user-bubble" : "ai-bubble"}>{m.text}</div>
          ))}
          {isTyping && <div className="ai-bubble" style={{opacity:0.4}}>...</div>}
        </div>
        <div className="glass-panel" style={s.dock}>
          <button onClick={handleVoice} className={isListening ? "pulse-red" : ""} style={s.micBtn}>🎤</button>
          <input style={s.dockInput} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask SkillLens..." />
          <button className="neon-btn" style={s.send} onClick={handleSend}>↑</button>
        </div>
      </main>
    </div>
  );
}

const s = {
  app: { display: 'flex', height: '100vh', background:'#05070a' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width:'100%' },
  authCard: { width: '360px', padding: '50px', borderRadius: '35px', textAlign: 'center' },
  logoCircle: { background:'#6366f1', width:'60px', height:'60px', borderRadius:'50%', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'900' },
  subtitle: { fontSize:'9px', fontWeight:'800', color:'#475569', marginBottom:'30px', letterSpacing:'1.5px' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #1e293b', color: '#fff', marginBottom: '18px', outline:'none' },
  mainBtn: { width:'100%', padding:'16px', marginTop:'10px' },
  toggle: { fontSize:'11px', color:'#6366f1', marginTop:'20px', cursor:'pointer', fontWeight:'600' },
  side: { width: '250px', display: 'flex', flexDirection: 'column', padding: '20px' },
  logoSmall: { background:'#6366f1', width:'35px', height:'35px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', marginBottom:'30px' },
  newBtn: { width:'100%', padding:'12px', border:'1px dashed #334155', background:'none', color:'#fff', borderRadius:'10px', fontSize:'11px', fontWeight:'800', cursor:'pointer', marginBottom:'20px' },
  sideProfile: { display:'flex', alignItems:'center', gap:'12px', padding:'15px 5px', borderTop:'1px solid #1e293b', cursor:'pointer', marginTop:'10px' },
  avSmall: { width:'35px', height:'35px', borderRadius:'10px', objectFit:'cover', background:'#0f172a' },
  main: { flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' },
  chat: { flex: 1, padding: '40px 18%', overflowY: 'auto', display:'flex', flexDirection:'column' },
  empty: { margin:'auto', color:'#1e293b', fontWeight:'900', fontSize:'12px', letterSpacing:'2px' },
  dock: { position: 'absolute', bottom: '35px', left: '18%', right: '18%', padding: '12px 25px', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '15px' },
  micBtn: { background:'none', border:'none', color:'#6366f1', fontSize:'22px', cursor:'pointer' },
  dockInput: { flex: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '15px' },
  send: { width: '45px', height: '45px' },
  pCard: { width: '400px', padding: '50px', borderRadius: '40px', textAlign: 'center' },
  label: { fontSize:'9px', color:'#475569', fontWeight:'900', marginBottom:'8px', display:'block' },
  logout: { color:'#ef4444', fontSize:'11px', marginTop:'25px', cursor:'pointer', fontWeight:'800', opacity:0.6 }
};