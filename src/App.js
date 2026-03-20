import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// --- AUTHENTICATION ---
const AuthView = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.id) onLogin(data); else alert("Access Denied.");
    } catch (err) { alert("Backend Offline."); }
  };

  return (
    <div className="mesh-bg" style={s.authPage}>
      <div className="glass-panel" style={s.authCard}>
        <div style={s.brandLogoLarge}>S</div>
        <h1 style={s.brandTitle}>skillens<span style={{color: '#6366f1'}}>.ai</span></h1>
        <form onSubmit={handleSubmit} style={s.formStack}>
          {mode === 'signup' && <input style={s.input} placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} required />}
          <input style={s.input} placeholder="Email" type="email" onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={s.input} placeholder="Password" type="password" onChange={e => setForm({...form, password: e.target.value})} required />
          <button type="submit" className="neon-btn" style={s.btnPrimary}>{mode.toUpperCase()}</button>
        </form>
        <p onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={s.toggleLink}>
          {mode === 'login' ? "Request Access →" : "Login to Workspace"}
        </p>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [view, setView] = useState('auth');
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [controller, setController] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('skill_user');
    if (saved) { const u = JSON.parse(saved); setUser(u); setView('home'); loadHistory(u.id); }
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isTyping]);

  const loadHistory = (uid) => fetch(`http://localhost:5000/api/history/${uid}`).then(r => r.json()).then(setHistory);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUser({ ...user, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech API not supported.");
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const newController = new AbortController();
    setController(newController);
    const currentChat = [...messages, { role: 'user', text: input }];
    setMessages(currentChat); setInput(''); setIsTyping(true);

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', signal: newController.signal,
        body: JSON.stringify({ model: 'phi3', prompt: input, stream: false })
      });
      const data = await res.json();
      const finalChat = [...currentChat, { role: 'ai', text: data.response }];
      setMessages(finalChat);
      fetch('http://localhost:5000/api/history', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.slice(0, 20), messages: finalChat, userId: user.id })
      }).then(() => loadHistory(user.id));
    } catch (e) {
      if (e.name === 'AbortError') setMessages([...currentChat, { role: 'ai', text: "⚠ Operation Terminated." }]);
    } finally { setIsTyping(false); }
  };

  if (view === 'auth') return <AuthView onLogin={(u) => { setUser(u); setView('home'); localStorage.setItem('skill_user', JSON.stringify(u)); loadHistory(u.id); }} />;

  return (
    <div style={s.appContainer}>
      {/* SIDEBAR */}
      <aside className="glass-panel" style={s.sideNav}>
        <div style={s.brandArea}><div style={s.brandLogo}>S</div><span style={s.brandName}>SkillLens<span style={{color:'#6366f1'}}>AI</span></span></div>
        <button className="neon-btn" style={s.newChatBtn} onClick={() => setMessages([])}>+ NEW ANALYSIS</button>
        <div style={s.historyList}>
          <div style={s.listLabel}>HISTORY LOGS</div>
          {history.map(h => (
            <div key={h.id} style={s.hCard} onClick={() => setMessages(JSON.parse(h.messages))}># {h.title}</div>
          ))}
        </div>
        <div style={s.userProfile} onClick={() => setView('profile')}>
          <img src={user?.avatar || 'https://via.placeholder.com/150'} style={s.userAvatar} alt="p" />
          <div style={s.userInfo}><div style={s.userName}>{user?.name}</div><div style={s.userTier}>PRO MEMBER</div></div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main style={s.workspace}>
        {view === 'home' ? (
          <>
            <header style={s.topBar}>
              <div style={s.statusIndicator}><div className="pulse-dot"></div> Node: Phi-3 Active</div>
              <button style={s.ghostBtn} onClick={() => {localStorage.clear(); window.location.reload();}}>LOGOUT</button>
            </header>
            <div style={s.chatViewport} ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} style={m.role === 'user' ? s.uRow : s.aRow}>
                  <div className={m.role === 'user' ? "user-bubble" : "ai-bubble"} style={s.bubble}>{m.text}</div>
                </div>
              ))}
              {isTyping && <div style={s.typingRow}><div className="pulse-dot"></div><span style={s.typingText}>Analyzing...</span></div>}
            </div>
            <div className="glass-panel" style={s.commandDock}>
              <button onClick={handleVoice} className={isListening ? "pulse-red" : ""} style={{...s.iconBtn, color: isListening ? '#ef4444' : '#6366f1'}}>{isListening ? '●' : '🎤'}</button>
              <input style={s.dockInput} placeholder="Enter command..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={isTyping} />
              {isTyping ? <button onClick={() => controller?.abort()} style={s.stopActionBtn}>STOP ⏹</button> : <button className="neon-btn" style={s.sendIcon} onClick={handleSend}>↑</button>}
            </div>
          </>
        ) : (
          /* PROFILE HUB */
          <div style={s.profileCenter}>
            <div className="glass-panel" style={s.pCard}>
              <div style={s.avLargeWrap}>
                <img src={user.avatar || 'https://via.placeholder.com/150'} style={s.avLarge} alt="av" />
                <label style={s.avEdit}>✎<input type="file" hidden onChange={handleAvatarChange} /></label>
              </div>
              <div style={s.profileForm}>
                <div style={s.inputGroup}><label style={s.fieldLabel}>DISPLAY NAME</label>
                  <input style={s.input} value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} /></div>
                <div style={s.inputGroup}><label style={s.fieldLabel}>EMAIL ADDRESS</label>
                  <input style={s.input} value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} /></div>
              </div>
              <button onClick={() => { localStorage.setItem('skill_user', JSON.stringify(user)); setView('home'); }} className="neon-btn" style={s.saveBtn}>SAVE & RETURN</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SYSTEM STYLES ---
const s = {
  appContainer: { display: 'flex', height: '100vh', width: '100vw', background: '#080a0f' },
  authPage: { height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  authCard: { width: '400px', padding: '50px', borderRadius: '30px', textAlign: 'center' },
  brandLogoLarge: { background: '#6366f1', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#fff', fontWeight: 'bold' },
  brandTitle: { fontSize: '28px', color: '#fff', marginBottom: '30px', letterSpacing: '-1px' },
  formStack: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '15px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: '#fff', outline: 'none' },
  btnPrimary: { padding: '15px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', border: 'none' },
  toggleLink: { color: '#6366f1', marginTop: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  sideNav: { width: '270px', display: 'flex', flexDirection: 'column', padding: '24px' },
  brandArea: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '35px' },
  brandLogo: { background: '#6366f1', width: '30px', height: '30px', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  brandName: { fontWeight: '800', fontSize: '18px', color: '#fff' },
  newChatBtn: { padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '11px', marginBottom: '25px' },
  historyList: { flex: 1, overflowY: 'auto' },
  listLabel: { fontSize: '10px', color: '#475569', fontWeight: '800', marginBottom: '15px' },
  hCard: { padding: '12px', borderRadius: '10px', fontSize: '13px', color: '#94a3b8', cursor: 'pointer' },
  userProfile: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', cursor: 'pointer' },
  userAvatar: { width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' },
  userName: { fontSize: '14px', fontWeight: 'bold', color: '#fff' },
  userTier: { fontSize: '9px', color: '#6366f1', fontWeight: '900' },
  workspace: { flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' },
  topBar: { padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusIndicator: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#94a3b8' },
  chatViewport: { flex: 1, padding: '20px 20%', overflowY: 'auto' },
  bubble: { padding: '18px 24px', maxWidth: '85%', fontSize: '15px', lineHeight: '1.6' },
  uRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' },
  aRow: { display: 'flex', justifyContent: 'flex-start', marginBottom: '25px' },
  typingRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px' },
  typingText: { fontSize: '12px', color: '#6366f1', fontWeight: 'bold' },
  commandDock: { position: 'absolute', bottom: '35px', left: '20%', right: '20%', padding: '10px 12px 10px 22px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' },
  dockInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff' },
  sendIcon: { width: '45px', height: '45px', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  stopActionBtn: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 18px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' },
  iconBtn: { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' },
  ghostBtn: { background: 'none', border: 'none', color: '#475569', fontSize: '11px', fontWeight: '800', cursor: 'pointer' },
  profileCenter: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pCard: { width: '400px', padding: '50px', textAlign: 'center', borderRadius: '40px' },
  avLargeWrap: { position: 'relative', width: '120px', margin: '0 auto' },
  avLarge: { width: '120px', height: '120px', borderRadius: '30px', border: '4px solid #6366f1', objectFit: 'cover' },
  avEdit: { position: 'absolute', bottom: '5px', right: '5px', background: '#6366f1', color: '#fff', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid #080a0f' },
  profileForm: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px', textAlign: 'left' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fieldLabel: { fontSize: '10px', fontWeight: '800', color: '#6366f1', letterSpacing: '1px' },
  saveBtn: { width: '100%', marginTop: '30px', padding: '15px', borderRadius: '15px', fontWeight: '800' }
};