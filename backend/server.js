const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());

// Neon-optimized Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

// Graceful connection test
pool.connect()
  .then(() => console.log("✅ Connected to Neon Postgres successfully"))
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
    // Do NOT crash the server on cold start
  });

// Health check route
app.get("/", (req, res) => {
  res.send("✅ SkillLens API is LIVE on Neon 🚀");
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ====================== REGISTER ======================
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE username=$1 OR email=$2",
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ====================== LOGIN ======================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username/email and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $1",
      [username]
    );

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    delete user.password;
    res.json(user);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SkillLens API running on port ${PORT}`);
});