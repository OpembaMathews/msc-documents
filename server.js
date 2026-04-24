const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// --- FRONTEND ROUTE ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'sel-lms-platform.html'));
});

// --- API ROUTES ---

// 1. Get Global App Data (Landing + Personas + Features + Quotes + Lessons)
app.get('/api/init-data', (req, res) => {
    try {
        const stats = db.prepare("SELECT label, value FROM landing_stats").all();
        const personas = db.prepare("SELECT * FROM personas").all();
        const features = db.prepare("SELECT * FROM features").all();
        const quotesRows = db.prepare("SELECT mood_key, quote FROM mood_quotes").all();
        const lessons = db.prepare("SELECT * FROM lessons").all();

        const quotes = quotesRows.reduce((acc, q) => ({ ...acc, [q.mood_key]: q.quote }), {});

        res.json({ stats, personas, features, quotes, lessons });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get User State & Scores
app.get('/api/state', (req, res) => {
    try {
        const user = db.prepare("SELECT * FROM users WHERE id = 1").get();
        const progressRows = db.prepare("SELECT lesson_id FROM progress").all();
        const scoreRows = db.prepare("SELECT * FROM scores").all();

        res.json({
            user: { name: user.name, level: user.level },
            view: user.current_view,
            currentLessonId: user.current_lesson_id,
            mood: user.last_mood,
            completedLessons: progressRows.map(p => p.lesson_id),
            scores: scoreRows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Update State
app.post('/api/state', (req, res) => {
    const { view, currentLessonId, mood } = req.body;
    try {
        if (mood) {
            db.prepare("INSERT INTO mood_logs (mood) VALUES (?)").run(mood);
            db.prepare("UPDATE users SET last_mood = ? WHERE id = 1").run(mood);
        }
        if (view) db.prepare("UPDATE users SET current_view = ? WHERE id = 1").run(view);
        if (currentLessonId) db.prepare("UPDATE users SET current_lesson_id = ? WHERE id = 1").run(currentLessonId);
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Mark Lesson Complete
app.post('/api/progress', (req, res) => {
    const { lessonId } = req.body;
    try {
        db.prepare("INSERT OR IGNORE INTO progress (lesson_id) VALUES (?)").run(lessonId);
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
