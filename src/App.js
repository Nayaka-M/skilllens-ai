import React, { useState, useEffect, useRef } from 'react';

// CONFIGURATION - CHANGE THIS TO YOUR VERCEL KEY
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API || "YOUR_GROQ_KEY_HERE";
const API_URL = "https://skilllens-ai-1.onrender.com";

const themes = {
  purple: { 
    bg: '#F3F4F9', 
    accent: '#8B5CF6', 
    text: '#1F2937', 
    surface: '#FFFFFF', 
    glass: 'rgba(139, 92, 246, 0.1)', 
    border: '#E5E7EB',
    shadow: '0 10px 30px rgba(0,0,0,0.05)'
  }
};

export default function SkillLens() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('sl_user')) || null);
  const [view, setView] = useState('terminal');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const ui = themes.purple;

  useEffect(() => { 
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages]);

  if (!user) return <AuthScreen setUser={setUser} ui={ui} />;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userQ = input;
    setMessages(prev => [...prev, { role: 'user', text: userQ }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          model: "llama-3.3-70b-versatile", 
          messages: [{ role: "user", content: userQ }] 
        })
      });
      const data = await res.json();
      const aiResponse = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);

      // Sync count to DB
      await fetch(`${API_URL}/api/user/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, chat_count: (user.chat_count || 0) + 1 })
      });
    } catch (e) {
      alert("AI Processing Failed. Check Groq Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', background: ui.bg, color: ui.text, display: 'flex', flexDirection: 'column', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: ui.surface, padding: '15px 25px', borderRadius: '20px', boxShadow: ui.shadow }}>
        <h2 style={{ color: ui.accent, margin: 0, fontWeight: '900' }}>SKILLLENS AI</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>{user.username}</span>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <main style={{ flex: 1, background: ui.surface, borderRadius: '30px', padding: '30px', overflowY: 'auto', boxShadow: ui.shadow }}>
        {messages.length === 0 && <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.5 }}><h1>How can I help you today?</h1></div>}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: '20px', padding: '20px', background: m.role === 'ai' ? ui.glass : '#f9f9fb', borderRadius: '20px', border: `1px solid ${ui.border}`, maxWidth: '80%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <small style={{ color: ui.accent, fontWeight: 'bold' }}>{m.role.toUpperCase()}</small>
            <p style={{ lineHeight: '1.6', marginTop: '10px' }}>{m.text}</p>
          </div>
        ))}
        {loading && <p style={{ color: ui.accent }}>AI is thinking...</p>}
        <div ref={scrollRef} />
      </main>

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px', background: ui.surface, padding: '10px', borderRadius: '20px', boxShadow: ui.shadow }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask anything..." style={{ flex: 1, padding: '15px 20px', borderRadius: '15px', border: 'none', outline: 'none', fontSize: '16px' }} />
        <button onClick={sendMessage} disabled={loading} style={{ background: ui.accent, color: '#fff', border: 'none', padding: '0 30px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>SEND</button>
      </div>
    </div>
  );
}

function AuthScreen({ setUser, ui }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async () => {
    if (!form.username || !form.password) return alert("Please fill all fields");
    setAuthLoading(true);
    const path = isLogin ? "/api/login" : "/api/register";
    
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('sl_user', JSON.stringify(data));
        setUser(data);
      } else {
        alert(data.error || "Server error");
      }
    } catch (e) {
      alert("Backend is waking up... Wait 30 seconds and try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2f7' }}>
      <div style={{ width: '380px', padding: '50px', background: '#fff', borderRadius: '35px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h1 style={{ color: ui.accent, marginBottom: '10px', fontWeight: '900' }}>SkillLens</h1>
        <p style={{ opacity: 0.6, marginBottom: '30px' }}>{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        
        <input placeholder="Username or Email" style={authInp} onChange={e => setForm({...form, username: e.target.value})} />
        {!isLogin && <input placeholder="Email Address" style={authInp} onChange={e => setForm({...form, email: e.target.value})} />}
        <input type="password" placeholder="Password" style={authInp} onChange={e => setForm({...form, password: e.target.value})} />
        
        <button onClick={handleAuth} disabled={authLoading} style={{ width: '100%', padding: '16px', background: ui.accent, color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(139, 92, 246, 0.3)' }}>
          {authLoading ? 'CONNECTING...' : (isLogin ? 'LOG IN' : 'SIGN UP')}
        </button>
        
        <p onClick={() => setIsLogin(!isLogin)} style={{ marginTop: '25px', cursor: 'pointer', fontSize: '14px', color: ui.accent, fontWeight: '600' }}>
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

const authInp = { width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #eee', background: '#f9f9fb', outline: 'none', boxSizing: 'border-box' };