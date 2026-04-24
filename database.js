const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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
    description TEXT,
    video_url TEXT,
    module TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    week TEXT,
    category TEXT,
    summary TEXT,
    points TEXT,
    blog_url TEXT,
    module TEXT
)`);

// --- 3. SEEDING LOGIC ---
const userCount = db.prepare("SELECT count(*) as count FROM users").get().count;
if (userCount === 0) {
    db.prepare("INSERT INTO users (name, level) VALUES (?, ?)").run("Graduate Scholar", "Master");
    
    // Seed Stats
    db.prepare("INSERT INTO landing_stats (label, value) VALUES ('Wellbeing Checks', '5,000+')").run();
    db.prepare("INSERT INTO landing_stats (label, value) VALUES ('Research Modules', '25+')").run();
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

    // Seed Lessons with New YouTube Videos
    const insertLesson = db.prepare("INSERT INTO lessons (id, title, duration, description, video_url, module) VALUES (?, ?, ?, ?, ?, ?)");
    insertLesson.run(1, 'Piaget vs. Vygotsky', '03:45', 'A concise comparison of cognitive and social constructivism.', 'https://www.youtube.com/embed/Jp_v_6-v_6k', 'Constructivism');
    insertLesson.run(2, 'The Capability Approach', '12:30', 'Amartya Sen’s framework for social inclusion and wellbeing.', 'https://www.youtube.com/embed/H3lRkFFH7_U', 'Community_Wellbeing');
    insertLesson.run(3, 'Digital Wellbeing Science', '03:15', 'Understanding how tech habits affect your mental health.', 'https://www.youtube.com/embed/v_v_v_v_v_v', 'Digital_SEL');
    insertLesson.run(4, 'Constructivist Theory', '15:20', 'Deep dive into schemas, ZPD, and scaffolding.', 'https://www.youtube.com/embed/f_2_6_6_6_6', 'Constructivism');
    insertLesson.run(5, 'Giambattista Vico', '10:15', 'The philosophical roots of constructivism: Verum Factum.', 'https://www.youtube.com/embed/3_3_3_3_3_3', 'Constructivism');

    // --- AUTOMATIC FILE SCANNING ---
    const baseDir = path.resolve(__dirname, 'Digital Learning');
    const modules = ['Constructivism', 'Digital_SEL', 'Community_Wellbeing'];
    const insertResource = db.prepare("INSERT INTO resources (name, type, week, category, summary, points, blog_url, module) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    modules.forEach(mod => {
        const modPath = path.join(baseDir, mod);
        if (fs.existsSync(modPath)) {
            const files = fs.readdirSync(modPath);
            files.forEach(file => {
                if (file.startsWith('.') || file.endsWith('.db') || file.endsWith('.js')) return;
                
                const ext = path.extname(file).replace('.', '');
                const fileName = path.basename(file, path.extname(file));
                
                insertResource.run(
                    fileName.replace(/_/g, ' '),
                    ext,
                    "01-14",
                    "reading",
                    `Academic material from the ${mod} folder.`,
                    "Research,Analysis,Theory",
                    "#",
                    mod
                );
            });
        }
    });
}

module.exports = db;
