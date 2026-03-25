const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());

// PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Test route
app.get("/", (req, res) => {
  res.send("SkillLens API running 🚀");
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE USER
app.post("/api/user/update", async (req, res) => {
  const { id, username, email, profile_pic, mobile, dob, chat_history, chat_count } = req.body;

  try {
    const updated = await pool.query(
      `UPDATE users SET username=$1, email=$2, profile_pic=$3, mobile=$4, dob=$5, chat_history=$6, chat_count=$7 WHERE id=$8 RETURNING *`,
      [username, email, profile_pic, mobile, dob, JSON.stringify(chat_history || []), chat_count, id]
    );

    res.json(updated.rows[0]);

  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// AI CHAT
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: message }],
    });

    res.json({
      reply: response.choices[0].message.content,
    });

  } catch (err) {
    res.status(500).json({ error: "AI error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));