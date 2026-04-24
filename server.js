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
    const data = {};
    db.all("SELECT label, value FROM landing_stats", (err, stats) => {
        data.stats = stats;
        db.all("SELECT * FROM personas", (err, personas) => {
            data.personas = personas;
            db.all("SELECT * FROM features", (err, features) => {
                data.features = features;
                db.all("SELECT mood_key, quote FROM mood_quotes", (err, quotes) => {
                    data.quotes = quotes.reduce((acc, q) => ({ ...acc, [q.mood_key]: q.quote }), {});
                    db.all("SELECT * FROM lessons", (err, lessons) => {
                        data.lessons = lessons;
                        res.json(data);
                    });
                });
            });
        });
    });
});

// 2. Get User State & Scores
app.get('/api/state', (req, res) => {
    db.get("SELECT * FROM users WHERE id = 1", (err, user) => {
        db.all("SELECT lesson_id FROM progress", (err, progressRows) => {
            db.all("SELECT * FROM scores", (err, scoreRows) => {
                res.json({
                    user: { name: user.name, level: user.level },
                    view: user.current_view,
                    currentLessonId: user.current_lesson_id,
                    mood: user.last_mood,
                    completedLessons: progressRows.map(p => p.lesson_id),
                    scores: scoreRows
                });
            });
        });
    });
});

// 3. Update State
app.post('/api/state', (req, res) => {
    const { view, currentLessonId, mood } = req.body;
    if (mood) {
        db.run("INSERT INTO mood_logs (mood) VALUES (?)", [mood]);
        db.run("UPDATE users SET last_mood = ? WHERE id = 1", [mood]);
    }
    if (view) db.run("UPDATE users SET current_view = ? WHERE id = 1", [view]);
    if (currentLessonId) db.run("UPDATE users SET current_lesson_id = ? WHERE id = 1", [currentLessonId]);
    res.json({ status: "success" });
});

// 4. Mark Lesson Complete
app.post('/api/progress', (req, res) => {
    const { lessonId } = req.body;
    db.run("INSERT OR IGNORE INTO progress (lesson_id) VALUES (?)", [lessonId], (err) => {
        res.json({ status: "success" });
    });
});

// 5. Get Research Resources
app.get('/api/resources', (req, res) => {
    db.all("SELECT * FROM resources", (err, rows) => {
        const formatted = rows.map(r => ({ ...r, points: r.points.split(',') }));
        res.json(formatted);
    });
});

app.listen(PORT, () => {
    console.log(`Nexus Backend running at http://localhost:${PORT}`);
});
