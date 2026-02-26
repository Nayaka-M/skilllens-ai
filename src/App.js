import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  // Persistence: Load data from LocalStorage
  const [user, setUser] = useState(localStorage.getItem("skillLens_user") || null);
  const [mastery, setMastery] = useState(parseInt(localStorage.getItem("skillLens_mastery")) || 15);
  const [userName, setUserName] = useState("");
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [latency, setLatency] = useState(0);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const chatEndRef = useRef(null);

  // Sync data to LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("skillLens_user", user);
      localStorage.setItem("skillLens_mastery", mastery.toString());
    }
  }, [user, mastery]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setUser(userName);
      const welcomeMsg = `Welcome, ${userName}! Your current mastery is ${mastery}%. What shall we learn?`;
      setMessages([{ role: "assistant", content: welcomeMsg }]);
      speak(welcomeMsg);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = voiceRate;
    window.speechSynthesis.speak(speech);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice not supported.");
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const startTime = performance.now();
    const currentInput = input;
    setMessages(p => [...p, { role: "user", content: currentInput }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: currentInput,
          masteryLevel: mastery // Adaptive Logic
        }),
      });
      const data = await res.json();
      const endTime = performance.now();
      
      setLatency((endTime - startTime).toFixed(0));
      setMessages(p => [...p, { role: "assistant", content: data.reply }]);
      setMastery(p => Math.min(p + 10, 100));
      speak(data.reply);
    } catch (err) {
      setMessages(p => [...p, { role: "assistant", content: "Error: AI Engine Offline." }]);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className={`login-screen ${highContrast ? "high-contrast" : ""}`}>
        <div className="login-card">
          <div className="amd-badge">Powered by AMD Ryzen™ AI</div>
          <h1>SkillLens AI</h1>
          <p>Inclusive Skilling Platform</p>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Student Name..." value={userName} onChange={(e)=>setUserName(e.target.value)} required />
            <button type="submit" className="login-btn">Start Session</button>
          </form>
          <button className="theme-toggle" onClick={()=>setHighContrast(!highContrast)}>High Contrast Mode</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${highContrast ? "high-contrast" : ""}`}>
      <div className="amd-telemetry">AMD NPU Inference: {latency}ms</div>

      <header className="header">
        <div className="top-nav">
          <div className="brand">
            <h1>SkillLens AI</h1>
            <span className="user-tag">Student: {user}</span>
          </div>
          <div className="controls">
            <input type="range" min="0.5" max="1.5" step="0.1" value={voiceRate} onChange={(e)=>setVoiceRate(e.target.value)} title="Voice Speed" />
            <button onClick={() => setHighContrast(!highContrast)}>Theme</button>
            <button onClick={handleLogout} className="logout-btn">Reset</button>
          </div>
        </div>

        <div className="gamify-bar">
          <div className="bar-labels">
            <span>Mastery: {mastery}%</span>
            <div className="badges">
              {mastery >= 30 && <span className="pop">🚀</span>}
              {mastery >= 60 && <span className="pop">🧠</span>}
              {mastery >= 90 && <span className="pop">🏆</span>}
            </div>
          </div>
          <div className="progress-bg"><div className="progress-fill" style={{width:`${mastery}%`}}></div></div>
        </div>
      </header>

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>{m.content}</div>
        ))}
        {loading && <div className="loader">AMD NPU Processing...</div>}
        <div ref={chatEndRef} />
      </div>

      <footer className="footer">
        <button className={`mic-btn ${isListening ? "on" : ""}`} onClick={startVoiceInput}>🎤</button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask your tutor (e.g., Explain gravity)..." />
        <button className="send-btn" onClick={sendMessage}>Ask AI</button>
      </footer>
    </div>
  );
}

export default App;