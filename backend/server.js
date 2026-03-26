const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// --- 🔓 CORS CONFIGURATION ---
// This allows your specific Vercel URL to access the API
app.use(cors({
  origin: ["http://localhost:3000", "https://skilllens-frontend-final.vercel.app"], // Add your new Vercel URL here
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// --- 🗄️ DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
});

// Test Database Connection on Startup
pool.connect((err) => {
  if (err) console.error("❌ Database Connection Error:", err.stack);
  else console.log("✅ Connected to Neon Postgres");
});

// --- 🔑 AUTH ROUTES ---

// Registration
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "User already exists or DB error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body; 
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 OR email=$1",
      [username]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        delete user.password;
        res.json(user);
      } else {
        res.status(401).json({ error: "Incorrect password" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/", (req, res) => res.send("SkillLens API is LIVE 🚀"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});