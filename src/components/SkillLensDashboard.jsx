import React, { useState, useEffect } from 'react';
import ChatTerminal from './ChatTerminal';
import WelcomeHome from './WelcomeHome';

const SkillLensDashboard = ({ user, token, onUpdateUser, onLogout }) => {
  // --- STATE ---
  const [view, setView] = useState('home'); 
  const [selectedSkill, setSelectedSkill] = useState('General Help'); // Fixed ReferenceError
  const [history, setHistory] = useState([]); // Default to empty array
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name, email: user?.email });

  const skills = [
    { id: 'general', name: 'General Help', icon: '💡' },
    { id: 'farming', name: 'Smart Farming', icon: '🌾' },
    { id: 'electric', name: 'Electrical Work', icon: '⚡' },
    { id: 'mobile', name: 'Mobile Repair', icon: '📱' },
  ];

  // --- FETCH HISTORY ---
  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/history', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      })
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : [])) // Ensure it's an array
      .catch(err => setHistory([]));
    }
  }, [token, view]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/user/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editData)
    });
    if (res.ok) {
      const data = await res.json();
      onUpdateUser(data.user);
      setIsEditing(false);
      alert("Profile updated!");
    }
  };

  return (
    <div style={s.wrapper}>
      <nav style={s.nav}>
        <div style={{ fontWeight: 'bold', color: '#10a37f', fontSize: '20px' }}>SkillLens-AI</div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={s.xpBadge}>LVL {user?.level || 1} | {user?.xp || 0} XP</div>
          <button onClick={onLogout} style={s.logout}>Logout</button>
        </div>
      </nav>

      <div style={s.body}>
        <aside style={s.sidebar}>
          <div onClick={() => setView('home')} style={view === 'home' ? s.skillBtnActive : s.skillBtn}>🏠 Home</div>
          <hr style={s.divider} />
          <label style={s.label}>SKILL TRACKS</label>
          {skills.map(skill => (
            <div key={skill.id} 
              onClick={() => { setSelectedSkill(skill.name); setView('terminal'); }}
              style={(view === 'terminal' && selectedSkill === skill.name) ? s.skillBtnActive : s.skillBtn}>
              {skill.icon} {skill.name}
            </div>
          ))}
          <hr style={s.divider} />
          <div onClick={() => setView('profile')} style={view === 'profile' ? s.skillBtnActive : s.skillBtn}>👤 Profile</div>
        </aside>

        <main style={s.content}>
          {view === 'home' && (
            <WelcomeHome 
              user={user} 
              history={history || []} 
              onStartLearning={() => setView('terminal')} 
            />
          )}
          
          {view === 'terminal' && (
            <ChatTerminal user={user} token={token} currentSkill={selectedSkill} />
          )}

          {view === 'profile' && (
            <div style={{padding: '40px'}}>
              <h2>Profile Settings</h2>
              <div style={s.card}>
                <label>Name</label>
                <input style={s.input} defaultValue={user?.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                <button onClick={handleProfileUpdate} style={s.btn}>Update</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const s = {
  wrapper: { height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial' },
  nav: { height: '60px', display: 'flex', justifyContent: 'space-between', padding: '0 30px', alignItems: 'center', borderBottom: '1px solid #eee' },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '240px', background: '#f9f9f9', borderRight: '1px solid #eee', padding: '20px' },
  content: { flex: 1, overflowY: 'auto' },
  label: { fontSize: '10px', color: '#999', fontWeight: 'bold', marginBottom: '10px', display: 'block' },
  skillBtn: { padding: '12px', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px' },
  skillBtnActive: { padding: '12px', cursor: 'pointer', borderRadius: '8px', marginBottom: '5px', background: '#e6f4f1', color: '#10a37f', fontWeight: 'bold' },
  xpBadge: { background: '#10a37f', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '12px' },
  divider: { border: 'none', borderTop: '1px solid #eee', margin: '15px 0' },
  input: { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ddd' },
  btn: { background: '#10a37f', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' },
  logout: { background: 'none', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }
};

export default SkillLensDashboard;