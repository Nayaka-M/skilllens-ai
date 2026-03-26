require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 10000;

// 1. Middleware Configuration
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "https://skilllens-ui-v2.vercel.app"], // Add your Vercel URL here
  methods: ["GET", "POST"],
  credentials: true
}));

// 2. Database Connection (Neon Postgres)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon/Render SSL connections
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 🔥 CRITICAL: Prevent the "Unhandled error event" crash
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle database client:', err.message);
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error acquiring client', err.stack);
  }
  console.log('✅ Connected to Neon Postgres');
  release();
});

// 3. API Routes

// Registration Route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username',
      [username, email, hashedPassword]
    );
    console.log(`👤 User Registered: ${username}`);
    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Reg Error:", err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: "User or Email already exists" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful", username: user.username });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Health Check Route
app.get('/', (req, res) => {
  res.send('SkillLens Backend is Live 🚀');
});

// 4. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});