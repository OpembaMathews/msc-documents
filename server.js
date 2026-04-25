const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '793974376445-clmcg4oub8kaatv352kge9qsqolth0iu.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET || 'nexus-scholar-secret-2026';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname));

// --- AUTH MIDDLEWARE ---
const authenticateUser = (req, res, next) => {
    const token = req.cookies.nexus_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// --- FRONTEND ROUTES ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'sel-lms-platform.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog.html'));
});

// --- API ROUTES ---

// 1. Google Auth Login
app.post('/api/auth/google', async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId);
        if (!user) {
            const info = db.prepare("INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)").run(googleId, email, name, picture);
            user = { id: info.lastInsertRowid, name, picture };
        }

        // Create JWT
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('nexus_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        
        res.json({ status: "success", user: { id: user.id, name: user.name, picture: user.picture } });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Authentication failed" });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('nexus_token');
    res.json({ status: "success" });
});

// 2. Get Global App Data
app.get('/api/init-data', (req, res) => {
    try {
        const stats = db.prepare("SELECT label, value FROM landing_stats").all();
        const lessons = db.prepare("SELECT * FROM lessons").all();
        res.json({ stats, lessons });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Individual User State
app.get('/api/state', authenticateUser, (req, res) => {
    try {
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId);
        const progressRows = db.prepare("SELECT lesson_id FROM progress WHERE user_id = ?").all(req.userId);
        const scoreRows = db.prepare("SELECT * FROM scores WHERE user_id = ?").all(req.userId);

        res.json({
            user: { name: user.name, picture: user.picture, level: user.level },
            completedLessons: progressRows.map(p => p.lesson_id),
            scores: scoreRows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Mark Individual Progress
app.post('/api/progress', authenticateUser, (req, res) => {
    const { lessonId } = req.body;
    try {
        db.prepare("INSERT OR IGNORE INTO progress (user_id, lesson_id) VALUES (?, ?)").run(req.userId, lessonId);
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Get Research Resources
app.get('/api/resources', (req, res) => {
    try {
        const rows = db.prepare("SELECT * FROM resources").all();
        const formatted = rows.map(r => ({ ...r, points: r.points.split(',') }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Nexus Backend running at http://localhost:${PORT}`);
});
