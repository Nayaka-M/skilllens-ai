const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const JWT_SECRET = "SKILLLENS_2026_KEY";

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'SKILLLENS-AI',
  password: 'Nayaka1&',
  port: 5432,
});

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No Token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) { res.status(401).json({ error: "Invalid Token" }); }
};

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, level, xp",
      [name, email, hashed]
    );
    const token = jwt.sign({ id: result.rows[0].id }, JWT_SECRET);
    res.json({ token, user: result.rows[0] });
  } catch (err) { res.status(500).json({ error: "Registration Error" }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User Not Found" });
    const valid = await bcrypt.compare(password, result.rows[0].password);
    if (!valid) return res.status(401).json({ error: "Invalid Password" });
    
    const token = jwt.sign({ id: result.rows[0].id }, JWT_SECRET);
    const { password: _, ...user } = result.rows[0];
    res.json({ token, user });
  } catch (err) { res.status(500).json({ error: "Login Error" }); }
});

// --- HISTORY ---
app.post('/api/history/save', authenticate, async (req, res) => {
  const { session_name, transcript } = req.body;
  try {
    await pool.query("INSERT INTO chat_history (user_id, session_name, transcript) VALUES ($1, $2, $3)",
      [req.user.id, session_name, JSON.stringify(transcript)]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/history', authenticate, async (req, res) => {
  const result = await pool.query("SELECT * FROM chat_history WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);
  res.json(result.rows);
});

app.listen(5000, () => console.log('Server running on 5000'));