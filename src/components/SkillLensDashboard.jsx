import React, { useState, useEffect } from 'react';
import ChatTerminal from './ChatTerminal';

const SkillLensDashboard = ({ user, token, onUpdateUser, onLogout }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [view, setView] = useState('terminal'); 
  const [profileTab, setProfileTab] = useState('name');
  const [history, setHistory] = useState([]);
  const [viewingTranscript, setViewingTranscript] = useState(null);

  // CRITICAL: This state holds your current chat so it doesn't disappear
  const [activeChat, setActiveChat] = useState([]);

  useEffect(() => {
    if (view === 'profile' && profileTab === 'history' && token) {
      fetch('http://localhost:5000/api/history', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setHistory(data); })
      .catch(err => console.error("Load Error:", err));
    }
  }, [profileTab, view, token]);

  if (!hasStarted) {
    return (
      <div style={s.splash}>
        <h1 style={{ color: '#10a37f', fontSize: '48px', margin: 0 }}>SkillLens-AI</h1>
        <button onClick={() => setHasStarted(true)} style={s.startBtn}>Get Started</button>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <nav style={s.nav}>
        <div style={{ fontWeight: 'bold', color: '#10a37f', fontSize: '20px' }}>SkillLens-AI</div>
        <div style={{ display: 'flex', gap: '30px' }}>
          <span onClick={() => setView('terminal')} style={view === 'terminal' ? s.act : s.lnk}>Dashboard</span>
          <span onClick={() => setView('profile')} style={view === 'profile' ? s.act : s.lnk}>Profile</span>
        </div>
        <button onClick={onLogout} style={s.logout}>Logout</button>
      </nav>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        {view === 'terminal' ? (
          <ChatTerminal 
            user={user} 
            token={token} 
            messages={activeChat} 
            setMessages={setActiveChat} 
            onUpdateUser={onUpdateUser} 
          />
        ) : (
          <div style={s.profileContainer}>
            <div style={s.tabs}>
              <span onClick={() => {setProfileTab('name'); setViewingTranscript(null);}} style={profileTab === 'name' ? s.tabA : s.tab}>Account</span>
              <span onClick={() => setProfileTab('history')} style={profileTab === 'history' ? s.tabA : s.tab}>History</span>
            </div>

            <div style={{ marginTop: '30px' }}>
              {profileTab === 'name' ? (
                <div>
                  <label style={s.label}>OPERATOR_NAME</label>
                  <h3 style={s.val}>{user?.name}</h3>
                  <label style={s.label}>EMAIL_UPLINK</label>
                  <h3 style={s.val}>{user?.email}</h3>
                </div>
              ) : (
                <div>
                  {viewingTranscript ? (
                    <div>
                      <button onClick={() => setViewingTranscript(null)} style={s.backBtn}>← Back to List</button>
                      <div style={s.transcriptBox}>
                        {(() => {
                          try {
                            const msgs = typeof viewingTranscript.transcript === 'string' 
                              ? JSON.parse(viewingTranscript.transcript) : viewingTranscript.transcript;
                            return msgs.map((m, i) => (
                              <div key={i} style={{ marginBottom: '15px' }}>
                                <b style={{ color: m.role === 'ai' ? '#10a37f' : '#333' }}>{m.role === 'ai' ? 'AI: ' : 'YOU: '}</b>
                                <span style={{ color: '#333' }}>{m.content}</span>
                              </div>
                            ));
                          } catch (e) { return <span>Error loading transcript.</span>; }
                        })()}
                      </div>
                    </div>
                  ) : (
                    history.map(h => (
                      <div key={h.id} style={s.card} onClick={() => setViewingTranscript(h)}>
                        <div style={{ color: '#333', fontWeight: 'bold' }}>{h.session_name}</div>
                        <div style={{ fontSize: '11px', color: '#999' }}>{new Date(h.created_at).toLocaleDateString()}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const s = {
  splash: { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff' },
  startBtn: { background: '#10a37f', color: '#fff', padding: '12px 35px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  wrapper: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' },
  nav: { display: 'flex', justifyContent: 'space-between', padding: '0 40px', height: '65px', alignItems: 'center', borderBottom: '1px solid #eee' },
  lnk: { cursor: 'pointer', color: '#666', fontSize: '14px' },
  act: { cursor: 'pointer', color: '#10a37f', fontWeight: 'bold', fontSize: '14px' },
  logout: { background: 'none', border: '1px solid #ddd', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' },
  profileContainer: { padding: '40px 20%' },
  tabs: { display: 'flex', gap: '30px', borderBottom: '1px solid #eee' },
  tab: { cursor: 'pointer', paddingBottom: '12px', color: '#888' },
  tabA: { cursor: 'pointer', paddingBottom: '12px', color: '#10a37f', borderBottom: '2px solid #10a37f', fontWeight: 'bold' },
  label: { fontSize: '10px', color: '#aaa', letterSpacing: '1px', display: 'block' },
  val: { color: '#333', marginBottom: '20px' },
  card: { padding: '15px', border: '1px solid #eee', borderRadius: '10px', cursor: 'pointer', marginBottom: '10px' },
  transcriptBox: { background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #eee' },
  backBtn: { background: 'none', border: 'none', color: '#10a37f', cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }
};

export default SkillLensDashboard;