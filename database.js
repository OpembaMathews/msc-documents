const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'nexus.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // --- 1. CORE USER & STATE ---
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        level TEXT,
        current_view TEXT DEFAULT 'dashboard',
        current_lesson_id INTEGER DEFAULT 1,
        last_mood TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS mood_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mood TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS progress (
        lesson_id INTEGER PRIMARY KEY
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS scores (
        id TEXT PRIMARY KEY,
        title TEXT,
        score INTEGER,
        date TEXT
    )`);

    // --- 2. LANDING & CONTENT ---
    db.run(`CREATE TABLE IF NOT EXISTS landing_stats (
        id INTEGER PRIMARY KEY,
        label TEXT,
        value TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS personas (
        id INTEGER PRIMARY KEY,
        title TEXT,
        description TEXT,
        icon TEXT,
        cta_text TEXT,
        target_view TEXT,
        color_class TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY,
        title TEXT,
        description TEXT,
        icon TEXT,
        bg_class TEXT,
        text_class TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS mood_quotes (
        mood_key TEXT PRIMARY KEY,
        quote TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY,
        title TEXT,
        duration TEXT,
        description TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY,
        name TEXT,
        type TEXT,
        week TEXT,
        category TEXT,
        summary TEXT,
        points TEXT,
        blog_url TEXT
    )`);

    // --- 3. SEEDING LOGIC ---
    db.get("SELECT count(*) as count FROM users", (err, row) => {
        if (row && row.count === 0) {
            db.run("INSERT INTO users (name, level) VALUES (?, ?)", ["Graduate Scholar", "Master"]);
            
            // Seed Scores
            db.run("INSERT INTO scores (id, title, score, date) VALUES ('quiz-1', 'Foundations Quiz', 85, '2024-04-10')");
            db.run("INSERT INTO scores (id, title, score, date) VALUES ('quiz-2', 'Digital Architectures', 92, '2024-04-15')");

            // Seed Stats
            db.run("INSERT INTO landing_stats (label, value) VALUES ('Wellbeing Checks', '5,000+')");
            db.run("INSERT INTO landing_stats (label, value) VALUES ('Research Modules', '12+')");
            db.run("INSERT INTO landing_stats (label, value) VALUES ('Student Engagement', '98%')");
            db.run("INSERT INTO landing_stats (label, value) VALUES ('Digital Support', '24/7')");

            // Seed Personas
            db.run("INSERT INTO personas (title, description, icon, cta_text, target_view, color_class) VALUES (?,?,?,?,?,?)", 
                ["For Students", "Personalized emotional tracking and curriculum that adapts to your mental state.", "graduation-cap", "Start as Student", "checkin", "text-indigo-600"]);
            db.run("INSERT INTO personas (title, description, icon, cta_text, target_view, color_class) VALUES (?,?,?,?,?,?)", 
                ["For Educators", "Real-time classroom climate insights and tools to foster resilience.", "presentation", "Educator Portal", "coming_soon", "text-emerald-600"]);
            db.run("INSERT INTO personas (title, description, icon, cta_text, target_view, color_class) VALUES (?,?,?,?,?,?)", 
                ["For Researchers", "Access anonymized wellbeing data and longitudinal studies.", "microscope", "Research Access", "library", "text-amber-600"]);

            // Seed Features
            db.run("INSERT INTO features (title, description, icon, bg_class, text_class) VALUES (?,?,?,?,?)",
                ["Psychology of Well-being", "Explore the latest research on mental health in the digital age.", "brain", "bg-indigo-50", "text-indigo-600"]);
            db.run("INSERT INTO features (title, description, icon, bg_class, text_class) VALUES (?,?,?,?,?)",
                ["Community Co-Creation", "Learn how to build resilient digital communities through shared agency.", "users", "bg-emerald-50", "text-emerald-600"]);
            db.run("INSERT INTO features (title, description, icon, bg_class, text_class) VALUES (?,?,?,?,?)",
                ["AI & Future Literacies", "Navigate the ethics and impact of Generative AI on wellbeing.", "code-2", "bg-amber-50", "text-amber-600"]);

            // Seed Mood Quotes
            db.run("INSERT INTO mood_quotes (mood_key, quote) VALUES ('focused', 'Deep work is the path to mastery. You are ready.')");
            db.run("INSERT INTO mood_quotes (mood_key, quote) VALUES ('stressed', 'It is okay to slow down. Maybe start with a reading today?')");
            db.run("INSERT INTO mood_quotes (mood_key, quote) VALUES ('curious', 'The mind is a fire to be kindled. Explore freely.')");
            db.run("INSERT INTO mood_quotes (mood_key, quote) VALUES ('tired', 'Small steps lead to great distances. Just one lesson?')");

            // Seed Lessons
            db.run("INSERT INTO lessons (id, title, duration, description) VALUES (1, 'Foundations of Wellbeing', '12:05', 'Introduction to digital SEL frameworks.')");
            db.run("INSERT INTO lessons (id, title, duration, description) VALUES (2, 'Vico & Constructivism', '18:30', 'Philosophical roots of learning theories.')");
            db.run("INSERT INTO lessons (id, title, duration, description) VALUES (3, 'The Capability Approach', '15:10', 'Understanding social inclusion.')");
            db.run("INSERT INTO lessons (id, title, duration, description) VALUES (4, 'Architectures of Safety', '22:00', 'Designing learning spaces.')");
            db.run("INSERT INTO lessons (id, title, duration, description) VALUES (5, 'AI & Student Wellbeing', '14:45', 'Ethical frameworks for GenAI.')");

            // Seed Resources (same as before)
            const initialResources = [
                { id: 1, name: "Well-being in the Digital Age", type: "pdf", week: "01", category: "reading", summary: "Foundational paper on digital immersion.", points: "Definition,Neuroplasticity,Strategies", blog_url: "#" },
                { id: 2, name: "Community Well-Being & Innovation", type: "pdf", week: "03", category: "reading", summary: "Fostering community resilience.", points: "Design,SEL,Case Studies", blog_url: "#" }
                // ... (I will use a loop for the rest in the script)
            ];
            const stmt = db.prepare("INSERT INTO resources (id, name, type, week, category, summary, points, blog_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            initialResources.forEach(r => stmt.run(r.id, r.name, r.type, r.week, r.category, r.summary, r.points, r.blog_url));
            stmt.finalize();

            for (let i = 3; i <= 23; i++) {
                db.run("INSERT INTO resources (id, name, type, week, category, summary, points, blog_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
                    [i, `Research Material ${i}`, i % 2 === 0 ? "pdf" : "pptx", "11", "reading", "General SEL resource.", "SEL,Education,Data", "#"]);
            }
        }
    });
});

module.exports = db;
