const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'SKILLLENS-AI',
  password: 'Nayaka1&',
  port: 5432,
});

// Check Connection
pool.connect((err) => {
  if (err) console.error('❌ DB CONNECTION ERROR:', err.message);
  else console.log('✅ DATABASE CONNECTED');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- UPDATED PROFILE ROUTE ---
app.put('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  const { full_name, email, mobile } = req.body;
  
  try {
    console.log(`Updating profile for: ${username}`); // Log for debugging
    const result = await pool.query(
      'UPDATE users SET full_name = $1, email = $2, mobile = $3 WHERE username = $4',
      [full_name || '', email || '', mobile || '', username]
    );
    res.json({ message: "Update Successful" });
  } catch (err) {
    console.error("❌ SQL ERROR:", err.message); // This shows in your terminal
    res.status(500).json({ error: err.message });
  }
});

// Get Profile & Stats
app.get('/api/profile/:username', async (req, res) => {
  try {
    let user = await pool.query('SELECT * FROM users WHERE username = $1', [req.params.username]);
    if (user.rows.length === 0) {
      user = await pool.query('INSERT INTO users (username) VALUES ($1) RETURNING *', [req.params.username]);
    }
    const stats = await pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN completed_at::date = CURRENT_DATE THEN 1 END) as today FROM user_history WHERE username = $1', [req.params.username]);
    res.json({ ...user.rows[0], stats: stats.rows[0] });
  } catch (err) { res.status(500).send(err.message); }
});

// History Routes
app.post('/api/history', async (req, res) => {
  try {
    await pool.query('INSERT INTO user_history (username, activity_name) VALUES ($1, $2)', [req.body.username, req.body.question]);
    res.sendStatus(201);
  } catch (e) { res.status(500).send(e.message); }
});

app.get('/api/history/:username', async (req, res) => {
  const result = await pool.query('SELECT * FROM user_history WHERE username = $1 ORDER BY completed_at DESC LIMIT 5', [req.params.username]);
  res.json(result.rows);
});

app.listen(5000, '127.0.0.1', () => console.log('🚀 Server running on http://127.0.0.1:5000'));