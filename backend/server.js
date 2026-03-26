const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs"); // Use bcryptjs
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
});

// 1. REGISTRATION (Stores Hashed Password)
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
    console.error("Reg Error:", err.message);
    res.status(500).json({ error: "User already exists or database error" });
  }
});

// 2. LOGIN (Compares Input to Hashed Password)
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Allows login via username OR email
    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 OR email=$1",
      [username]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (isMatch) {
        delete user.password; // Securely remove password before sending
        res.json(user);
      } else {
        res.status(401).json({ error: "Incorrect password" });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/", (req, res) => res.send("SkillLens API is LIVE 🚀"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});