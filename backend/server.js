const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Chat Endpoint
app.post("/chat", async (req, res) => {
  const { message, masteryLevel } = req.body;
  const systemPrompt = `You are SkillLens AI, a tutor. Mastery: ${masteryLevel || 15}%. Explain simply.`;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi", // Matches your 'ollama list'
        prompt: systemPrompt + "\nStudent: " + message,
        stream: false,
      }),
    });

    const data = await response.json();
    res.json({ reply: data.response });
  } catch (error) {
    console.error("Ollama Error:", error);
    res.status(500).json({ error: "Ollama communication failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🧠 Connected to Ollama model: phi`);
});