const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'nexus.db');
const db = new Database(dbPath);

// --- 1. CORE USER & STATE ---
db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    level TEXT,
    current_view TEXT DEFAULT 'dashboard',
    current_lesson_id INTEGER DEFAULT 1,
    last_mood TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS mood_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mood TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.exec(`CREATE TABLE IF NOT EXISTS progress (
    lesson_id INTEGER PRIMARY KEY
)`);

db.exec(`CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    title TEXT,
    score INTEGER,
    date TEXT
)`);

// --- 2. LANDING & CONTENT ---
db.exec(`CREATE TABLE IF NOT EXISTS landing_stats (
    id INTEGER PRIMARY KEY,
    label TEXT,
    value TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS personas (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT,
    icon TEXT,
    cta_text TEXT,
    target_view TEXT,
    color_class TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT,
    icon TEXT,
    bg_class TEXT,
    text_class TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS mood_quotes (
    mood_key TEXT PRIMARY KEY,
    quote TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY,
    title TEXT,
    duration TEXT,
    description TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS resources (
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
const userCount = db.prepare("SELECT count(*) as count FROM users").get().count;
if (userCount === 0) {
    db.prepare("INSERT INTO users (name, level) VALUES (?, ?)").run("Graduate Scholar", "Master");
    
    // Seed Scores
    db.prepare("INSERT INTO scores (id, title, score, date) VALUES ('quiz-1', 'Foundations Quiz', 85, '2024-04-10')").run();
    db.prepare("INSERT INTO scores (id, title, score, date) VALUES ('quiz-2', 'Digital Architectures', 92, '2024-04-15')").run();

    // Seed Stats
    db.prepare("INSERT INTO landing_stats (label, value) VALUES ('Wellbeing Checks', '5,000+')").run();
    db.prepare("INSERT INTO landing_stats (label, value) VALUES ('Research Modules', '12+')").run();
    db.prepare("INSERT INTO landing_stats (label, value) VALUES ('Student Engagement', '98%')").run();
    db.prepare("INSERT INTO landing_stats (label, value) VALUES ('Digital Support', '24/7')").run();

    // Seed Personas
    const insertPersona = db.prepare("INSERT INTO personas (title, description, icon, cta_text, target_view, color_class) VALUES (?,?,?,?,?,?)");
    insertPersona.run("For Students", "Personalized emotional tracking and curriculum that adapts to your mental state.", "graduation-cap", "Start as Student", "checkin", "text-indigo-600");
    insertPersona.run("For Educators", "Real-time classroom climate insights and tools to foster resilience.", "presentation", "Educator Portal", "coming_soon", "text-emerald-600");
    insertPersona.run("For Researchers", "Access anonymized wellbeing data and longitudinal studies.", "microscope", "Research Access", "library", "text-amber-600");

    // Seed Features
    const insertFeature = db.prepare("INSERT INTO features (title, description, icon, bg_class, text_class) VALUES (?,?,?,?,?)");
    insertFeature.run("Psychology of Well-being", "Explore the latest research on mental health in the digital age.", "brain", "bg-indigo-50", "text-indigo-600");
    insertFeature.run("Community Co-Creation", "Learn how to build resilient digital communities through shared agency.", "users", "bg-emerald-50", "text-emerald-600");
    insertFeature.run("AI & Future Literacies", "Navigate the ethics and impact of Generative AI on wellbeing.", "code-2", "bg-amber-50", "text-amber-600");

    // Seed Mood Quotes
    const insertQuote = db.prepare("INSERT INTO mood_quotes (mood_key, quote) VALUES (?, ?)");
    insertQuote.run('focused', 'Deep work is the path to mastery. You are ready.');
    insertQuote.run('stressed', 'It is okay to slow down. Maybe start with a reading today?');
    insertQuote.run('curious', 'The mind is a fire to be kindled. Explore freely.');
    insertQuote.run('tired', 'Small steps lead to great distances. Just one lesson?');

    // Seed Lessons
    const insertLesson = db.prepare("INSERT INTO lessons (id, title, duration, description) VALUES (?, ?, ?, ?)");
    insertLesson.run(1, 'Foundations of Wellbeing', '12:05', 'Introduction to digital SEL frameworks.');
    insertLesson.run(2, 'Vico & Constructivism', '18:30', 'Philosophical roots of learning theories.');
    insertLesson.run(3, 'The Capability Approach', '15:10', 'Understanding social inclusion.');
    insertLesson.run(4, 'Architectures of Safety', '22:00', 'Designing learning spaces.');
    insertLesson.run(5, 'AI & Student Wellbeing', '14:45', 'Ethical frameworks for GenAI.');

    // Seed Resources
    const initialResources = [
        { id: 1, name: "Well-being in the Digital Age", type: "pdf", week: "01", category: "reading", summary: "Foundational paper on digital immersion.", points: "Definition,Neuroplasticity,Strategies", blog_url: "#" },
        { id: 2, name: "Community Well-Being & Innovation", type: "pdf", week: "03", category: "reading", summary: "Fostering community resilience.", points: "Design,SEL,Case Studies", blog_url: "#" }
    ];
    const insertResource = db.prepare("INSERT INTO resources (id, name, type, week, category, summary, points, blog_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    initialResources.forEach(r => insertResource.run(r.id, r.name, r.type, r.week, r.category, r.summary, r.points, r.blog_url));

    for (let i = 3; i <= 23; i++) {
        insertResource.run(i, `Research Material ${i}`, i % 2 === 0 ? "pdf" : "pptx", "11", "reading", "General SEL resource.", "SEL,Education,Data", "#");
    }
}

module.exports = db;
