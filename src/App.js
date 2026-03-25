import React, { useState, useEffect, useRef } from 'react';

const API_URL = "https://skilllens-ai-2.onrender.com";

const themes = {
  purple: { bg: '#F3F4F9', accent: '#8B5CF6', text: '#1F2937', surface: '#FFFFFF', glass: 'rgba(139, 92, 246, 0.1)', border: '#E5E7EB' }
};

export default function SkillLens() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('sl_user')) || null);
  const [theme] = useState('purple');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const ui = themes[theme];
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return <AuthScreen setUser={setUser} ui={ui} />;

  const syncData = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('sl_user', JSON.stringify(updatedUser));

    try {
      const res = await fetch(`${API_URL}/api/user/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser)
      });
      const data = await res.json();
      setUser(data);
    } catch {
      console.error("Backend error");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userQ = input;
    setMessages([...messages, { role: 'user', text: userQ }]);
    setInput('');

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQ })
      });

      const data = await res.json();
      const aiA = data.reply;

      setMessages(prev => [...prev, { role: 'ai', text: aiA }]);

      const history = [...(user.chat_history || []), {
        q: userQ,
        a: aiA,
        time: new Date().toLocaleString()
      }];

      syncData({ chat_history: history, chat_count: (user.chat_count || 0) + 1 });

    } catch {
      alert("AI failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>SkillLens AI</h2>

      <div style={{ height: 300, overflow: 'auto', border: '1px solid #ccc', padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.role}:</b> {m.text}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={sendMessage}>Send</button>

      <br /><br />
      <button onClick={() => { localStorage.clear(); window.location.reload(); }}>
        Logout
      </button>
    </div>
  );
}

/* =========================
   AUTH SCREEN
========================= */
function AuthScreen({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', email: '' });

  const handleAuth = async () => {
    const path = isLogin ? "/api/login" : "/api/register";

    try {
      const res = await fetch(`https://skilllens-ai-2.onrender.com${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('sl_user', JSON.stringify(data));
        setUser(data);
      } else {
        alert(data.error);
      }

    } catch {
      alert("Backend is offline!");
    }
  };

  return (
    <div style={{ padding: 50 }}>
      <h2>{isLogin ? "Login" : "Register"}</h2>

      <input placeholder="Username"
        onChange={e => setForm({ ...form, username: e.target.value })} />

      {!isLogin && (
        <input placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })} />
      )}

      <input type="password" placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })} />

      <button onClick={handleAuth}>
        {isLogin ? "Login" : "Register"}
      </button>

      <br /><br />
      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? "Register" : "Login"}
      </button>
    </div>
  );
}