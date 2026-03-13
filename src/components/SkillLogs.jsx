import React from 'react';

const SkillLogs = () => {
  const history = [
    { date: '2026-03-12', task: 'Optimized PostgreSQL Join Query', xp: '+250' },
    { date: '2026-03-11', task: 'Integrated Ollama Phi-3 Model', xp: '+500' },
    { date: '2026-03-10', task: 'Created SkillLens Navigation Shell', xp: '+100' }
  ];

  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ color: '#34d399', letterSpacing: '2px', fontWeight: '900' }}>USER_HISTORY_LOG</h2>
      <div style={{ marginTop: '30px' }}>
        {history.map((h, i) => (
          <div key={i} style={logRow}>
            <span style={{ opacity: 0.4, width: '120px' }}>{h.date}</span>
            <span style={{ flex: 1 }}>{h.task}</span>
            <span style={{ color: '#34d399', fontWeight: 'bold' }}>{h.xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const logRow = { display: 'flex', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' };

export default SkillLogs;