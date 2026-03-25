import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'; // npm install react-markdown remark-gfm
import remarkGfm from 'remark-gfm';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY; // Better naming
const API_URL = "https://skilllens-ai-1.onrender.com";

export default function SkillLens() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sl_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [view] = useState('terminal'); // You can expand later
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!user) {
    return <AuthScreen setUser={setUser} />;
  }

  if (!GROQ_API_KEY) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <h2>Error: GROQ API Key Missing</h2>
        <p>Please set <code>REACT_APP_GROQ_API_KEY</code> in your .env file and restart the app.</p>
      </div>
    );
  }

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send full conversation history for better context
      const history = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [...history, { role: "user", content: trimmed }],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

      setMessages((prev) => [...prev, { role: 'ai', text: aiText }]);
    } catch (e) {
      console.error(e);
      const errorMsg = e.message.includes("401") 
        ? "Invalid Groq API key. Please check your key."
        : "AI service error. Please try again later.";
      setMessages((prev) => [...prev, { role: 'ai', text: `❌ ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      background: '#F3F4F9', 
      padding: '20px', 
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <nav style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h1 style={{ margin: 0, color: '#8B5CF6' }}>SkillLens</h1>
        <span>Logged in as: <b>{user.username}</b></span>
        <button 
          onClick={() => { 
            localStorage.clear(); 
            window.location.reload(); 
          }} 
          style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Logout
        </button>
      </nav>

      <main style={{ 
        flex: 1, 
        background: '#fff', 
        borderRadius: '20px', 
        padding: '20px', 
        overflowY: 'auto', 
        border: '1px solid #ddd',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <h3>Welcome to SkillLens Terminal</h3>
            <p>Ask anything about skills, career, resume, learning paths, or interviews!</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div 
            key={i} 
            style={{ 
              marginBottom: '20px', 
              padding: '14px 18px', 
              background: m.role === 'ai' ? '#f0f0ff' : '#f8f8f8', 
              borderRadius: '12px',
              borderLeft: m.role === 'ai' ? '4px solid #8B5CF6' : '4px solid #666'
            }}
          >
            <small style={{ fontWeight: 'bold', color: m.role === 'ai' ? '#8B5CF6' : '#555' }}>
              {m.role.toUpperCase()}
            </small>
            <div style={{ marginTop: '6px', lineHeight: 1.6 }}>
              {m.role === 'ai' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
              ) : (
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.text}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ padding: '10px', color: '#888', fontStyle: 'italic' }}>
            SkillLens is thinking...
          </div>
        )}

        <div ref={scrollRef} />
      </main>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask SkillLens anything... (skills, career advice, interview prep...)"
          disabled={isLoading}
          style={{ 
            flex: 1, 
            padding: '15px', 
            borderRadius: '10px', 
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />
        <button 
          onClick={sendMessage} 
          disabled={isLoading || !input.trim()}
          style={{ 
            background: isLoading ? '#ccc' : '#8B5CF6', 
            color: '#fff', 
            padding: '0 32px', 
            borderRadius: '10px', 
            border: 'none', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '...' : 'SEND'}
        </button>
      </div>
    </div>
  );
}

// AuthScreen remains mostly the same (minor improvements)
function AuthScreen({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!form.username || !form.password || (!isLogin && !form.email)) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
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
        alert(data.error || "Authentication failed");
      }
    } catch (e) {
      alert("Server is offline or network error. Check Render logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#e5e7eb' 
    }}>
      <div style={{ 
        background: '#fff', 
        padding: '40px', 
        borderRadius: '20px', 
        width: '360px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ textAlign: 'center', color: '#8B5CF6', marginBottom: '30px' }}>
          {isLogin ? 'Login to SkillLens' : 'Create Account'}
        </h2>

        <input 
          placeholder="Username or Email" 
          style={inpStyle} 
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} 
        />
        
        {!isLogin && (
          <input 
            placeholder="Email Address" 
            style={inpStyle} 
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
          />
        )}

        <input 
          type="password" 
          placeholder="Password" 
          style={inpStyle} 
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
        />

        <button 
          onClick={handleAuth} 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '15px', 
            background: loading ? '#ccc' : '#8B5CF6', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Processing...' : (isLogin ? 'LOG IN' : 'SIGN UP')}
        </button>

        <p 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            cursor: 'pointer', 
            fontSize: '14px',
            color: '#666'
          }}
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

const inpStyle = { 
  width: '100%', 
  padding: '14px', 
  marginBottom: '15px', 
  borderRadius: '8px', 
  border: '1px solid #ddd',
  fontSize: '16px'
};