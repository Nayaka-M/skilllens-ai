import React from 'react';

const SkillMap = () => {
  const stack = [
    { name: 'React.js', lv: 'Mastered', icon: '⚛️', color: '#61dafb' },
    { name: 'Node.js', lv: 'Advanced', icon: '🟢', color: '#68a063' },
    { name: 'PostgreSQL', lv: 'Intermediate', icon: '🐘', color: '#336791' },
    { name: 'Generative AI', lv: 'Locked', icon: '🤖', color: '#94a3b8' }
  ];

  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ color: '#34d399', letterSpacing: '2px', fontWeight: '900' }}>TECH_STACK_PROGRESSION</h2>
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        {stack.map((s, i) => (
          <div key={i} style={{ 
            width: '160px', padding: '25px', background: 'rgba(255,255,255,0.03)', 
            border: `2px solid ${s.lv === 'Locked' ? '#1e293b' : '#34d399'}`,
            borderRadius: '24px', textAlign: 'center', opacity: s.lv === 'Locked' ? 0.4 : 1
          }}>
            <div style={{ fontSize: '2.5rem' }}>{s.icon}</div>
            <h4 style={{ margin: '10px 0 5px 0', fontSize: '14px' }}>{s.name}</h4>
            <div style={{ fontSize: '10px', fontWeight: '900', color: '#34d399' }}>{s.lv.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillMap;