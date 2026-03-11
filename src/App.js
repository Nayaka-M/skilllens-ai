import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Typewriter from './Typewriter';

const App = () => {
  const [tab, setTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const scrollRef = useRef(null);

  // --- PERSISTENT STATE ---
  const [theme, setTheme] = useState(localStorage.getItem('sl_theme') || 'cyber');
  const [xp, setXp] = useState(Number(localStorage.getItem('sl_xp')) || 0);
  const [sp, setSp] = useState(Number(localStorage.getItem('sl_sp')) || 0);
  const [streak, setStreak] = useState(Number(localStorage.getItem('sl_streak')) || 1);
  const [lastSeen, setLastSeen] = useState(localStorage.getItem('sl_last_date') || "");
  
  const [inventory, setInventory] = useState(JSON.parse(localStorage.getItem('sl_inv')) || [
    { id: 'b1', name: 'First Contact', icon: '📡', level: 1, unlocked: true },
    { id: 'b2', name: 'Code Breaker', icon: '🔑', level: 2, unlocked: false },
    { id: 'b3', name: 'System Legend', icon: '👑', level: 5, unlocked: false }
  ]);

  const [logs, setLogs] = useState(JSON.parse(localStorage.getItem('sl_logs')) || [
    { id: 1, msg: "System Initialized.", time: "BOOT" }
  ]);

  // --- DYNAMIC DATA ---
  const currentLevel = Math.floor(xp / 100) + 1;
  const leaderboard = [
    { name: "Cypher_X", xp: 5000 },
    { name: "V0id_Walker", xp: 3500 },
    { name: "Nayaka", xp: xp, isPlayer: true },
    { name: "Zero_Day", xp: 850 },
    { name: "Root_Access", xp: 420 }
  ].sort((a, b) => b.xp - a.xp);

  const themes = {
    cyber: { primary: '#6366f1', glow: 'rgba(99, 102, 241, 0.2)', bg: '#020617', card: '#0f172a' },
    hacker: { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.2)', bg: '#050505', card: '#0a0a0a' },
    pink: { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.2)', bg: '#0f0714', card: '#1a0b1e' }
  };
  const activeTheme = themes[theme];

  // --- LOGIC: STREAKS & UNLOCKS ---
  useEffect(() => {
    // 1. Check Streak
    const today = new Date().toLocaleDateString();
    if (lastSeen !== today) {
      setStreak(s => s + 1);
      setLastSeen(today);
      addLog("Daily Login Bonus: Streak Extended.");
    }

    // 2. Auto-Unlock Badges
    setInventory(prev => prev.map(item => 
      (currentLevel >= item.level && !item.unlocked) 
      ? { ...item, unlocked: true } : item
    ));

    // 3. Save to Storage
    localStorage.setItem('sl_xp', xp);
    localStorage.setItem('sl_sp', sp);
    localStorage.setItem('sl_theme', theme);
    localStorage.setItem('sl_last_date', today);
    localStorage.setItem('sl_streak', streak);
    localStorage.setItem('sl_inv', JSON.stringify(inventory));
    localStorage.setItem('sl_logs', JSON.stringify(logs.slice(0, 10))); // Keep last 10 logs
  }, [xp, currentLevel, theme]);

  const addLog = (msg) => {
    const newLog = { id: Date.now(), msg, time: new Date().toLocaleTimeString() };
    setLogs(prev => [newLog, ...prev]);
  };

  const askAI = async () => {
    if (!question.trim()) return;
    setChatLog(prev => [...prev, { role: 'user', content: question, id: Date.now() }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:11434/api/generate', { 
        model: 'phi3:latest', prompt: question, stream: false 
      });
      setChatLog(prev => [...prev, { role: 'ai', content: res.data.response, id: Date.now() + 1 }]);
      
      const newXp = xp + 40;
      if (Math.floor(newXp / 100) > Math.floor(xp / 100)) {
        setShowLevelUp(true);
        setSp(s => s + 1);
        addLog(`LEVEL UP: Reached Level ${Math.floor(newXp / 100) + 1}`);
        setTimeout(() => setShowLevelUp(false), 2000);
      }
      setXp(newXp);
    } catch (err) {
      addLog("CRITICAL: AI Uplink Failed.");
    }
    setLoading(false);
  };

  return (
    <div style={{...styles.layout, background: activeTheme.bg}}>
      {showLevelUp && <div style={{...styles.levelOverlay, color: activeTheme.primary, borderColor: activeTheme.primary}}>LEVEL UP +1 SP</div>}

      <aside style={{...styles.sidebar, borderRight: `1px solid ${activeTheme.primary}33`}}>
        <div style={styles.sideProfile}>
          <div style={{...styles.miniAvatar, borderColor: activeTheme.primary}}>🛡️</div>
          <div><p style={styles.label}>OPERATOR</p><h3>Nayaka</h3></div>
        </div>
        <div style={{...styles.streakBadge, borderColor: activeTheme.primary}}>🔥 {streak} DAY STREAK</div>
        <nav style={styles.navStack}>
          <button style={tab === 'chat' ? {...styles.navActive, background: activeTheme.glow} : styles.navBtn} onClick={() => setTab('chat')}>💬 TERMINAL</button>
          <button style={tab === 'profile' ? {...styles.navActive, background: activeTheme.glow} : styles.navBtn} onClick={() => setTab('profile')}>📊 DASHBOARD</button>
        </nav>
      </aside>

      <main style={styles.mainContent}>
        {tab === 'chat' && (
          <div style={{...styles.chatContainer, borderColor: `${activeTheme.primary}22`}}>
            <div style={styles.chatHeader}>
               <span style={{fontFamily: 'Orbitron', fontSize:'0.6rem'}}>RANK: #{leaderboard.findIndex(o => o.isPlayer) + 1}</span>
               <p style={{fontSize: '0.7rem', color: activeTheme.primary}}>LVL {currentLevel}</p>
            </div>
            <div style={styles.messageThread} ref={scrollRef}>
              {chatLog.map(msg => (
                <div key={msg.id} style={msg.role === 'user' ? styles.userRow : styles.aiRow}>
                  <div style={{...styles.bubble, background: msg.role === 'user' ? activeTheme.primary : 'rgba(255,255,255,0.05)'}}>
                    {msg.role === 'ai' ? <Typewriter text={msg.content} /> : msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.inputArea}>
              <input style={styles.chatInput} value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askAI()} placeholder="Execute command..." />
              <button onClick={askAI} style={{...styles.sendBtn, background: activeTheme.primary}}>EXEC</button>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div style={{...styles.chatCard, background: activeTheme.card, borderColor: `${activeTheme.primary}33`}}>
            <div style={styles.dashboardGrid}>
              <section>
                <h2 style={styles.headerSmall}>STATUS</h2>
                <div style={styles.statCard}>
                   <h1 style={{color: activeTheme.primary, margin:'10px 0'}}>LVL {currentLevel}</h1>
                   <div style={styles.statLine}><span>XP</span> <span>{xp}</span></div>
                   <div style={styles.statLine}><span>SP</span> <span>{sp}</span></div>
                </div>
                <h2 style={{...styles.headerSmall, marginTop:'20px'}}>INVENTORY</h2>
                <div style={styles.inventoryGrid}>
                  {inventory.map(b => (
                    <div key={b.id} style={{...styles.badgeBox, opacity: b.unlocked ? 1 : 0.2, borderColor: b.unlocked ? activeTheme.primary : '#333'}}>
                      {b.unlocked ? b.icon : '🔒'}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 style={styles.headerSmall}>SYSTEM LOG</h2>
                <div style={styles.logContainer}>
                  {logs.map(log => (
                    <div key={log.id} style={styles.logEntry}>
                      <span style={{color: activeTheme.primary}}>[{log.time}]</span> {log.msg}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 style={styles.headerSmall}>RANKINGS</h2>
                {leaderboard.map((op, i) => (
                  <div key={op.name} style={{...styles.rankRow, background: op.isPlayer ? activeTheme.glow : 'transparent'}}>
                    <span style={{fontSize:'0.7rem', width:'20px'}}>#{i+1}</span>
                    <span style={{fontSize:'0.75rem', flex:1}}>{op.name}</span>
                    <span style={{fontSize:'0.6rem'}}>{op.xp} XP</span>
                  </div>
                ))}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  layout: { display: 'flex', height: '100vh', color: '#fff', overflow: 'hidden', position: 'relative' },
  levelOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#000', padding: '30px', borderRadius: '15px', zIndex: 100, border: '2px solid', fontFamily:'Orbitron' },
  sidebar: { width: '260px', background: 'rgba(0,0,0,0.4)', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' },
  sideProfile: { display: 'flex', alignItems: 'center', gap: '12px' },
  miniAvatar: { width: '40px', height: '40px', borderRadius: '50%', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  streakBadge: { padding: '10px', borderRadius: '8px', border: '1px solid', fontSize: '0.65rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' },
  navStack: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  navBtn: { background: 'transparent', border: 'none', color: '#64748b', textAlign: 'left', padding: '12px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.65rem' },
  navActive: { color: '#fff', textAlign: 'left', padding: '12px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.65rem', borderRadius: '8px' },
  mainContent: { flex: 1, display: 'flex', justifyContent: 'center', padding: '20px' },
  chatContainer: { width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '15px', border: '1px solid' },
  chatHeader: { padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' },
  messageThread: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  userRow: { display: 'flex', justifyContent: 'flex-end' },
  aiRow: { display: 'flex', justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem' },
  inputArea: { padding: '20px', display: 'flex', gap: '10px' },
  chatInput: { flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid #333', borderRadius: '10px', color: '#fff', padding: '12px', outline: 'none' },
  sendBtn: { padding: '0 25px', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer' },
  chatCard: { width: '100%', maxWidth: '1000px', padding: '30px', borderRadius: '25px', border: '1px solid' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr', gap: '25px' },
  headerSmall: { fontFamily: 'Orbitron', fontSize:'0.7rem', marginBottom:'15px', opacity:0.5 },
  statCard: { background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' },
  statLine: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.65rem' },
  inventoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  badgeBox: { height: '50px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'8px', border:'1px solid', background:'rgba(255,255,255,0.02)' },
  logContainer: { background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', height: '250px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)' },
  logEntry: { fontSize: '0.6rem', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' },
  rankRow: { display: 'flex', alignItems: 'center', padding: '10px', borderRadius: '8px' },
  label: { fontSize: '0.6rem', color: '#64748b', fontWeight: 'bold' }
};

export default App;