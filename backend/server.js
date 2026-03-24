const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// 1. CORS - This allows your Netlify frontend to talk to this server
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", 
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// 2. DATABASE CONNECTION
// We use your specific URL. On Render, it's best to put this in an Env Var named DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://skilllens_db_a1h5_user:y3yfPnFhWYx2jKbgujDawBYboNu5Mskg@dpg-d71bgoq4d50c73bjmrhg-a.oregon-postgres.render.com/skilllens_db_a1h5",
  ssl: {
    rejectUnauthorized: false // This is mandatory for connecting to Render Postgres
  }
});

// 3. API ROUTES
app.get('/', (req, res) => res.send("SkillLens API is active 🚀"));

// Login logic
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2', 
      [username, password]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Profile logic
app.post('/api/user/update', async (req, res) => {
  const { id, username, email, profile_pic, mobile, dob, chat_history, chat_count } = req.body;
  try {
    const updated = await pool.query(
      `UPDATE users SET username=$1, email=$2, profile_pic=$3, mobile=$4, dob=$5, chat_history=$6, chat_count=$7 
       WHERE id=$8 RETURNING *`,
      [username, email, profile_pic, mobile, dob, JSON.stringify(chat_history || []), chat_count, id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// 4. PORT - Render assigns a port automatically
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));