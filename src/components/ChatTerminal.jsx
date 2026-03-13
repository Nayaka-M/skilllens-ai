import React, { useState, useRef, useEffect } from 'react';

const ChatTerminal = ({ token, user, messages, setMessages, onUpdateUser }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const speak = (t) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    window.speechSynthesis.speak(u);
  };

  const stopAI = () => window.speechSynthesis.cancel();

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition) return alert("Mic not supported");
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const save = async () => {
    const name = prompt("Session Name:");
    if(!name) return;
    await fetch('http://localhost:5000/api/history/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ session_name: name, transcript: messages })
    });
    alert("Saved!");
  };

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const txt = input; setInput('');
    
    // Update the Dashboard's state
    const updatedMessages = [...messages, { role: 'user', content: txt }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const res = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'phi3:latest', messages: [{ role: 'user', content: txt }], stream: false })
      });
      const data = await res.json();
      const aiReply = data.message.content;
      
      setMessages([...updatedMessages, { role: 'ai', content: aiReply }]);
      speak(aiReply);
    } catch { 
      setMessages([...updatedMessages, { role: 'ai', content: "AI Offline" }]); 
    } finally { setIsTyping(false); }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 40px', borderBottom: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={stopAI} style={btnStyle('red')}>Stop Voice</button>
        <button onClick={save} style={btnStyle('#10a37f')}>Save Session</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20%' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '20px', padding: '20px', background: m.role === 'ai' ? '#f7f7f8' : '#fff', borderRadius: '12px', marginBottom: '15px', border: '1px solid #eee' }}>
            <div style={{ fontWeight: 'bold', color: m.role === 'ai' ? '#10a37f' : '#333' }}>{m.role === 'ai' ? 'AI' : 'YOU'}</div>
            <div style={{ color: '#333', lineHeight: '1.6' }}>{m.content}</div>
          </div>
        ))}
        {isTyping && <div style={{ color: '#aaa', paddingLeft: '20px' }}>Thinking...</div>}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={send} style={{ padding: '20px 20% 40px', display: 'flex', gap: '10px' }}>
        <button type="button" onClick={toggleMic} style={{ background: isListening ? 'red' : '#f0f0f0', border: 'none', borderRadius: '50%', width: '45px', cursor: 'pointer' }}>{isListening ? '●' : '🎤'}</button>
        <input style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #ddd', color: '#333' }} value={input} onChange={e => setInput(e.target.value)} placeholder="Type or use mic..." />
      </form>
    </div>
  );
};

const btnStyle = (clr) => ({
  color: clr, border: `1px solid ${clr}`, background: 'none', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', padding: '5px 12px'
});

export default ChatTerminal;