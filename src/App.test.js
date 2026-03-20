import React, { useState } from 'react';
import Auth from './components/Auth';
import ChatTerminal from './components/ChatTerminal';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('chat');

  if (!user) return <Auth onLoginSuccess={(data) => setUser(data)} />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh' }}>
      {/* SIDEBAR */}
      <aside style={{ background: 'white', borderRight: '1px solid #e2e8f0', padding: '30px 20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontWeight: '800' }}>✦ SkillLens</h2>
        <nav style={{ flex: 1, marginTop: '40px' }}>
          <button onClick={() => setView('chat')} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: view === 'chat' ? '#f1f5f9' : 'transparent', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer' }}>💬 Chat</button>
          <button onClick={() => setView('dashboard')} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: 'none', background: view === 'dashboard' ? '#f1f5f9' : 'transparent', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>⚙️ Workspace</button>
        </nav>
        <button onClick={() => setUser(null)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>Logout</button>
      </aside>

      {/* CONTENT */}
      <main style={{ background: '#f8fafc', overflow: 'hidden', position: 'relative' }}>
        {view === 'chat' ? <ChatTerminal user={user} /> : <Dashboard user={user} onUpdate={setUser} />}
      </main>
    </div>
  );
}