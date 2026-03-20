import React from 'react';

const WelcomeHome = ({ user, history, onStartLearning }) => {
  // Calculate stats based on history
  const totalLessons = history.length;
  const sessionsThisWeek = history.filter(h => {
    const sessionDate = new Date(h.created_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return sessionDate > oneWeekAgo;
  }).length;

  return (
    <div style={s.container}>
      <header style={s.header}>
        <h1 style={s.title}>Good Day, {user?.name}</h1>
        <p style={s.subtitle}>Your vocational journey is moving forward. Check your stats below.</p>
      </header>

      <div style={s.grid}>
        {/* Level Card */}
        <div style={s.card}>
          <div style={s.icon}>🏆</div>
          <div style={s.cardLabel}>Current Level</div>
          <div style={s.cardValue}>Level {user?.level || 1}</div>
          <div style={s.progressBar}><div style={{...s.progressFill, width: `${(user?.xp % 100) || 10}%`}}></div></div>
        </div>

        {/* Lessons Completed */}
        <div style={s.card}>
          <div style={s.icon}>📚</div>
          <div style={s.cardLabel}>Archived Lessons</div>
          <div style={s.cardValue}>{totalLessons} Sessions</div>
          <p style={s.cardHint}>+{sessionsThisWeek} this week</p>
        </div>

        {/* Activity Card */}
        <div style={s.card}>
          <div style={s.icon}>🔥</div>
          <div style={s.cardLabel}>Learning Streak</div>
          <div style={s.cardValue}>3 Days</div>
          <p style={s.cardHint}>Keep it up!</p>
        </div>
      </div>

      <div style={s.actionArea}>
        <h3>Ready to pick up where you left off?</h3>
        <button onClick={onStartLearning} style={s.ctaBtn}>Enter Learning Terminal</button>
      </div>
    </div>
  );
};

const s = {
  container: { padding: '40px', maxWidth: '1000px', margin: '0 auto' },
  header: { marginBottom: '40px' },
  title: { fontSize: '32px', color: '#333', margin: 0 },
  subtitle: { color: '#666', marginTop: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  card: { background: '#fff', border: '1px solid #eee', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  icon: { fontSize: '30px', marginBottom: '15px' },
  cardLabel: { fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' },
  cardValue: { fontSize: '24px', fontWeight: 'bold', color: '#10a37f', margin: '10px 0' },
  cardHint: { fontSize: '12px', color: '#888', margin: 0 },
  progressBar: { height: '6px', background: '#f0f0f0', borderRadius: '3px', marginTop: '15px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#10a37f' },
  actionArea: { marginTop: '50px', textAlign: 'center', padding: '40px', background: '#f7fbf9', borderRadius: '20px' },
  ctaBtn: { padding: '15px 40px', background: '#10a37f', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }
};

export default WelcomeHome;