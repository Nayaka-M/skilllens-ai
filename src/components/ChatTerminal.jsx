import React from 'react';

const ChatTerminal = ({ user }) => {
  return (
    <div className="gpt-main" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-2px' }}>
          How can I help you, {user.name.split(' ')[0]}?
        </h1>
      </div>

      <div className="floating-action-bar" style={{ position: 'absolute', bottom: '40px', width: '80%', maxWidth: '700px', background: 'white', padding: '12px 24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <button style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>🎤</button>
        <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px' }} placeholder="Ask SkillLens anything..." />
        <button style={{ background: 'black', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold' }}>↑</button>
      </div>
    </div>
  );
};

export default ChatTerminal;