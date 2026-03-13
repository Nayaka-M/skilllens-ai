import React, { useState } from 'react';
import SkillLensDashboard from './components/SkillLensDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    const path = isRegistering ? 'register' : 'login';
    try {
      const res = await fetch(`http://localhost:5000/api/auth/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Backend Offline');
    }
  };

  // IF NOT LOGGED IN: Show Login/Register
  if (!token) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ width: '350px', textAlign: 'center' }}>
        <h1 style={{ color: '#10a37f' }}>SkillLens-AI</h1>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {isRegistering && <input style={s.input} placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />}
          <input style={s.input} placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
          <input style={s.input} type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
          <button style={s.btn}>{isRegistering ? 'Sign Up' : 'Log In'}</button>
        </form>
        <p style={{ cursor: 'pointer', color: '#10a37f', fontSize: '14px' }} onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Back to Login' : 'Create Account'}
        </p>
      </div>
    </div>
  );

  // IF LOGGED IN: Show the Dashboard (This is where the magic happens)
  return (
    <SkillLensDashboard 
      user={user} 
      token={token} 
      onUpdateUser={setUser} 
      onLogout={() => { setToken(null); setUser(null); }} 
    />
  );
}

const s = {
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' },
  btn: { padding: '12px', background: '#10a37f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default App;