import React, { useState } from 'react';

const Dashboard = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState({ ...user });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTemp({ ...temp, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const save = () => { onUpdate(temp); setIsEditing(false); };

  const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', marginTop: '8px', marginBottom: '20px' };

  return (
    <div style={{ padding: '60px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800' }}>Workspace</h1>
        <button onClick={isEditing ? save : () => setIsEditing(true)} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '14px 25px', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' }}>
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div style={{ background: 'white', padding: '40px', borderRadius: '30px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <img src={isEditing ? temp.avatar : user.avatar} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f1f5f9' }} alt="pfp" />
          {isEditing && (
            <label style={{ background: '#f1f5f9', padding: '8px 15px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
              Change Photo
              <input type="file" hidden onChange={handleFile} />
            </label>
          )}
        </div>

        <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>FULL NAME</label>
        {isEditing ? <input style={inputStyle} value={temp.name} onChange={e => setTemp({...temp, name: e.target.value})} /> : <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '25px' }}>{user.name}</p>}

        <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>MOBILE NUMBER</label>
        {isEditing ? <input style={inputStyle} value={temp.mobile} onChange={e => setTemp({...temp, mobile: e.target.value})} /> : <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '25px' }}>{user.mobile}</p>}

        <label style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8' }}>EMAIL ADDRESS</label>
        {isEditing ? <input style={inputStyle} value={temp.email} onChange={e => setTemp({...temp, email: e.target.value})} /> : <p style={{ fontSize: '18px', fontWeight: '700' }}>{user.email}</p>}
      </div>
    </div>
  );
};

export default Dashboard;