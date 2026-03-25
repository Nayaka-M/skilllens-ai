import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from "jspdf";

// REPLACE THIS with your key or use process.env.REACT_APP_GROQ_API
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API;
// Change this:


const themes = {
  purple: { bg: '#F3F4F9', accent: '#8B5CF6', text: '#1F2937', surface: '#FFFFFF', glass: 'rgba(139, 92, 246, 0.1)', border: '#E5E7EB' },
  midnight: { bg: '#0f172a', accent: '#38bdf8', text: '#f1f5f9', surface: '#1e293b', glass: 'rgba(56, 189, 248, 0.1)', border: '#334155' }
};

export default function SkillLens() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('sl_user')) || null);
  const [view, setView] = useState('dashboard');
  const [theme, setTheme] = useState(user?.theme_color || 'purple');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const ui = themes[theme] || themes.purple;
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // --- GATEKEEPER ---
  if (!user) return <AuthScreen setUser={setUser} ui={themes.purple} />;

  const syncData = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('sl_user', JSON.stringify(updatedUser));
    try {
      const res = await fetch("http://localhost:5000/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (e) { console.error("Sync Error: Check if server.js is running."); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => syncData({ profile_pic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const downloadPDF = (chat) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246); // Purple Accent
    doc.text("SkillLens AI Report", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${chat.time}`, 20, 30);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("User Question:", 20, 45);
    doc.setFont("helvetica", "normal");
    const qLines = doc.splitTextToSize(chat.q, 170);
    doc.text(qLines, 20, 52);

    const nextY = 60 + (qLines.length * 7);
    doc.setFont("helvetica", "bold");
    doc.text("AI Response:", 20, nextY);
    doc.setFont("helvetica", "normal");
    const aLines = doc.splitTextToSize(chat.a, 170);
    doc.text(aLines, 20, nextY + 7);

    doc.save(`SkillLens_${chat.time.replace(/[/:\s]/g, '-')}.pdf`);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userQ = input;
    const newMsgs = [...messages, { role: 'user', text: userQ }];
    setMessages(newMsgs);
    setInput('');

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          model: "llama-3.3-70b-versatile", 
          messages: newMsgs.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })) 
        })
      });
      const data = await res.json();
      const aiA = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'ai', text: aiA }]);

      const history = [...(user.chat_history || []), { q: userQ, a: aiA, time: new Date().toLocaleString() }];
      syncData({ chat_history: history, chat_count: (user.chat_count || 0) + 1 });
    } catch (e) { alert("AI Processing Failed."); }
  };

  return (
    <div style={{ height: '100vh', background: ui.bg, color: ui.text, display: 'flex', flexDirection: 'column', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 🚀 TOP NAVIGATION */}
      <nav style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <NavBox id="dashboard" icon="🔥" title="Stats" active={view === 'dashboard'} ui={ui} setView={setView} />
        <NavBox id="terminal" icon="📟" title="Terminal" active={view === 'terminal'} ui={ui} setView={setView} />
        <NavBox id="history" icon="📚" title="Logs" active={view === 'history'} ui={ui} setView={setView} />
        <div onClick={() => setView('profile')} style={{ flex: 1.5, padding: '15px', borderRadius: '25px', background: view === 'profile' ? ui.accent : ui.surface, color: view === 'profile' ? '#fff' : ui.text, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <img src={user.profile_pic || 'https://via.placeholder.com/100'} style={{ width: '45px', height: '45px', borderRadius: '15px', objectFit: 'cover', border: '2px solid #fff' }} alt="pfp" />
          <div style={{textAlign: 'left'}}>
            <div style={{ fontWeight: '900', fontSize: '14px' }}>{user.username}</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>View Profile</div>
          </div>
        </div>
      </nav>

      {/* ⚪ MAIN VIEWPORT */}
      <main style={{ flex: 1, background: ui.surface, borderRadius: '40px', padding: '40px', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
        
        {view === 'dashboard' && (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1 style={{ fontSize: '9rem', fontWeight: '900', color: ui.accent, margin: 0 }}>{user.streak_count}</h1>
            <p style={{ letterSpacing: '8px', opacity: 0.4, fontWeight: 'bold' }}>ACTIVE_STREAK_DAYS</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
                <div style={{ padding: '25px', background: ui.glass, borderRadius: '25px', flex: 1 }}><b>{user.chat_count}</b><br/>Queries</div>
                <div style={{ padding: '25px', background: ui.glass, borderRadius: '25px', flex: 1 }}><b>{theme.toUpperCase()}</b><br/>UI Theme</div>
            </div>
          </div>
        )}

        {view === 'terminal' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{opacity: 0.4, fontSize: '12px'}}>SKILL_LENS_TERMINAL_V4.0</span>
                <button onClick={() => setMessages([])} style={{ background: ui.accent + '22', color: ui.accent, border: 'none', padding: '8px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>+ NEW SESSION</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
              {messages.length === 0 ? <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', opacity:0.2}}>[ SYSTEM STANDBY ]</div> : 
                messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: '20px', padding: '20px', background: m.role === 'ai' ? ui.glass : ui.bg, borderRadius: '22px', border: m.role === 'ai' ? `1px solid ${ui.accent}22` : 'none' }}>
                    <small style={{ color: ui.accent, fontWeight: '900', fontSize: '10px' }}>{m.role === 'user' ? '● USER_PROMPT' : '● NEURAL_OUTPUT'}</small>
                    <p style={{ lineHeight: '1.6', marginTop: '8px' }}>{m.text}</p>
                  </div>
                ))
              }
              <div ref={scrollRef} />
            </div>
            <div style={{ display: 'flex', gap: '15px', background: ui.bg, padding: '20px', borderRadius: '25px', alignItems: 'center' }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Message SkillLens..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: ui.text, fontSize: '1rem' }} />
              <button onClick={sendMessage} style={{ background: ui.accent, color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>SEND</button>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div>
            <h2 style={{ fontWeight: '900', marginBottom: '25px' }}>Chat History Logs</h2>
            {user.chat_history?.length > 0 ? [...user.chat_history].reverse().map((h, i) => (
              <div key={i} style={{ padding: '25px', borderRadius: '25px', border: `1px solid ${ui.border}`, marginBottom: '15px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ opacity: 0.5, fontSize: '11px', fontWeight: 'bold' }}>{h.time}</span>
                  <button onClick={() => downloadPDF(h)} style={{ background: ui.accent, color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>DOWNLOAD PDF ↓</button>
                </div>
                <p><b>Q:</b> {h.q}</p>
                <p style={{ opacity: 0.8, marginTop: '10px' }}><b>A:</b> {h.a.substring(0, 200)}...</p>
              </div>
            )) : <p style={{opacity: 0.4}}>No logs found in neural storage.</p>}
          </div>
        )}

        {view === 'profile' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={user.profile_pic || 'https://via.placeholder.com/150'} style={{ width: '150px', height: '150px', borderRadius: '50px', objectFit: 'cover', border: `5px solid ${ui.accent}` }} alt="pfp" />
                <label style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: ui.accent, color: '#fff', padding: '12px', borderRadius: '20px', cursor: 'pointer', border: '5px solid #fff', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                  📷 <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <ProfileInput label="Full Name" value={user.username} onBlur={(v) => syncData({ username: v })} ui={ui} />
              <ProfileInput label="Email Address" value={user.email} onBlur={(v) => syncData({ email: v })} ui={ui} />
              <ProfileInput label="Mobile Number" value={user.mobile || ''} placeholder="e.g. +91 98765 43210" onBlur={(v) => syncData({ mobile: v })} ui={ui} />
              <ProfileInput label="Date of Birth" type="date" value={user.dob || ''} onBlur={(v) => syncData({ dob: v })} ui={ui} />
            </div>

            <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: '40px', width: '100%', color: '#ef4444', background: ui.accent + '11', border: 'none', padding: '18px', borderRadius: '20px', fontWeight: '900', cursor: 'pointer' }}>LOGOUT SESSION</button>
          </div>
        )}
      </main>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function AuthScreen({ setUser, ui }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', email: '' });

  const handleAuth = async () => {
    const path = isLogin ? "/api/login" : "/api/register";
    try {
      const res = await fetch(`http://localhost:5000${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('sl_user', JSON.stringify(data));
        setUser(data);
      } else { alert(data.error); }
    } catch (e) { alert("Backend is offline!"); }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e5ec', fontFamily: 'Inter' }}>
      <div style={{ display: 'flex', width: '850px', height: '520px', background: '#fff', borderRadius: '45px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.1)' }}>
        <div style={{ flex: 1.2, padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ color: ui.accent, textAlign: 'center', marginBottom: '30px', fontWeight: '900', fontSize: '2rem' }}>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
          <input placeholder="Username" style={authInp} onChange={e => setForm({...form, username: e.target.value})} />
          {!isLogin && <input placeholder="Email" style={authInp} onChange={e => setForm({...form, email: e.target.value})} />}
          <input type="password" placeholder="Password" style={authInp} onChange={e => setForm({...form, password: e.target.value})} />
          <button onClick={handleAuth} style={{ background: ui.accent, color: '#fff', border: 'none', padding: '18px', borderRadius: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>{isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}</button>
        </div>
        <div style={{ flex: 0.8, background: `linear-gradient(135deg, ${ui.accent} 0%, #4c1d95 100%)`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
          <h2 style={{fontWeight:'900', fontSize:'1.8rem'}}>{isLogin ? "New Here?" : "Welcome Back!"}</h2>
          <p style={{ margin: '20px 0', opacity: 0.9, lineHeight: '1.6' }}>{isLogin ? "Join our AI-powered learning terminal and build your skills." : "Login to pick up exactly where you left off."}</p>
          <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'transparent', border: '2px solid #fff', color: '#fff', padding: '12px 40px', borderRadius: '35px', cursor: 'pointer', fontWeight: 'bold' }}>{isLogin ? 'SIGN UP' : 'SIGN IN'}</button>
        </div>
      </div>
    </div>
  );
}

const NavBox = ({ id, icon, title, active, ui, setView }) => (
  <div onClick={() => setView(id)} style={{ flex: 1, padding: '18px', borderRadius: '22px', background: active ? ui.accent : ui.surface, color: active ? '#fff' : ui.text, cursor: 'pointer', textAlign: 'center', transition: '0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
    <div style={{ fontSize: '22px' }}>{icon}</div>
    <div style={{ fontWeight: 'bold', fontSize: '11px', marginTop: '5px' }}>{title.toUpperCase()}</div>
  </div>
);

const ProfileInput = ({ label, value, onBlur, ui, type = "text", placeholder }) => (
  <div style={{ textAlign: 'left' }}>
    <label style={{ fontSize: '11px', fontWeight: '900', color: ui.accent, marginLeft: '12px', textTransform: 'uppercase' }}>{label}</label>
    <input 
      type={type} 
      defaultValue={value} 
      placeholder={placeholder}
      onBlur={(e) => onBlur(e.target.value)} 
      style={{ width: '100%', padding: '14px 18px', borderRadius: '18px', border: `1px solid ${ui.border}`, background: ui.bg, marginTop: '6px', outline: 'none', color: ui.text }} 
    />
  </div>
);

const authInp = { width: '100%', padding: '16px', marginBottom: '16px', borderRadius: '18px', border: '1px solid #eee', background: '#f9f9f9', outline: 'none', fontSize: '14px' };