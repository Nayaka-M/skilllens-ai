import React, { useState } from 'react';

const Profile = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    mobile: user.mobile || 'NOT_SET',
    email: user.email
  });
  const [status, setStatus] = useState('');

  const handleSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...formData }),
      });
      
      if (res.ok) {
        setStatus("✅ DATABASE_UPDATED");
        setIsEditing(false);
        onUpdateUser(formData); // Update global state
      }
    } catch (err) {
      setStatus("⚠️ UPDATE_FAILED");
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <span>USER_PROFILE_DATA_ACCESS</span>
        <button onClick={() => setIsEditing(!isEditing)} className="terminal-action-btn">
          {isEditing ? '[ CANCEL ]' : '[ EDIT_DATA ]'}
        </button>
      </div>

      <div className="terminal-body">
        <div className="profile-data-grid">
          <div className="message-row ai">
            <span className="prefix">> NAME:</span>
            {isEditing ? (
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="terminal-inline-input" />
            ) : <span>{user.name}</span>}
          </div>

          <div className="message-row ai">
            <span className="prefix">> EMAIL:</span>
            <span>{user.email}</span> {/* Usually email is locked for security */}
          </div>

          <div className="message-row ai">
            <span className="prefix">> MOBILE:</span>
            {isEditing ? (
              <input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="terminal-inline-input" />
            ) : <span>{user.mobile || '---'}</span>}
          </div>

          <div className="message-row ai">
            <span className="prefix">> RANK:</span>
            <span className="highlight">LEVEL {user.level} (XP: {user.xp})</span>
          </div>
        </div>

        {isEditing && (
          <button onClick={handleSave} className="save-btn">EXECUTE_UPDATE</button>
        )}
        
        {status && <div className="status-msg">{status}</div>}
      </div>
    </div>
  );
};

export default Profile;