const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Allows for profile picture strings

let db;

(async () => {
    // Initialize SQLite Database
    db = await open({
        filename: './skillens.db',
        driver: sqlite3.Database
    });

    // Create Tables
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            avatar TEXT
        );
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            title TEXT,
            messages TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
})();

// --- AUTH ENDPOINTS ---
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const result = await db.run(
            'INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)',
            [name, email, password, 'https://via.placeholder.com/150']
        );
        res.json({ id: result.lastID, name, email, avatar: 'https://via.placeholder.com/150' });
    } catch (e) { res.status(400).json({ error: "Email already exists" }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (user) res.json(user);
    else res.status(401).json({ error: "Invalid Credentials" });
});

// --- HISTORY ENDPOINTS ---
app.post('/api/history', async (req, res) => {
    const { userId, title, messages } = req.body;
    await db.run(
        'INSERT INTO history (userId, title, messages) VALUES (?, ?, ?)',
        [userId, title, JSON.stringify(messages)]
    );
    res.json({ success: true });
});

app.get('/api/history/:userId', async (req, res) => {
    const rows = await db.all('SELECT * FROM history WHERE userId = ? ORDER BY timestamp DESC', [req.params.userId]);
    res.json(rows);
});

// Start Server
app.listen(5000, () => console.log('🚀 SkillLens Backend running on http://localhost:5000'));