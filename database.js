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
    
    // Constructivism
    insertLesson.run(1, 'Piaget vs. Vygotsky', '03:45', 'A concise comparison of cognitive and social constructivism.', 'https://www.youtube.com/embed/yY-SXMzajH0', 'Constructivism');
    insertLesson.run(3, 'Vygotsky’s Theory', '04:15', 'Understanding the Zone of Proximal Development and Social Development Theory.', 'https://www.youtube.com/embed/8I2hrSRbmHE', 'Constructivism');
    insertLesson.run(4, 'Piaget’s Theory', '06:15', 'A breakdown of cognitive development stages and schemas.', 'https://www.youtube.com/embed/IhcgYgx7aAA', 'Constructivism');
    insertLesson.run(5, 'Giambattista Vico', '10:15', 'The philosophical roots of constructivism: Verum Factum.', 'https://www.youtube.com/embed/8swo4fvHU4Y', 'Constructivism');

    // Digital SEL (VE5914701)
    insertLesson.run(2, 'The Science of Well-Being', '12:30', 'Yale Professor Laurie Santos on the psychological foundations of happiness.', 'https://www.youtube.com/embed/H3lRkFFH7_U', 'Digital_SEL');
    insertLesson.run(6, 'Social Media & Mental Health', '14:20', 'Bailey Parnell discusses the impact of social media on our wellbeing.', 'https://www.youtube.com/embed/Czg_9C7gw0o', 'Digital_SEL');
    insertLesson.run(7, 'The CASEL Framework', '05:10', 'Understanding the five core competencies of Social Emotional Learning.', 'https://www.youtube.com/embed/7S0vEzeO-Z8', 'Digital_SEL');
    insertLesson.run(8, 'The Digital Age Brain', '11:45', 'Dr. Imran Rashid on how technology influences human behavior.', 'https://www.youtube.com/embed/w7107s9SsqU', 'Digital_SEL');

    // Community Wellbeing (VE5915701)
    insertLesson.run(9, 'The Capability Approach', '08:50', 'Introduction to Amartya Sen’s framework for human development.', 'https://www.youtube.com/embed/fhzD-yCJvfM', 'Community_Wellbeing');
    insertLesson.run(10, 'Digital Inclusion', '05:30', 'Why closing the digital divide is essential for community wellbeing.', 'https://www.youtube.com/embed/zJ51cfrB4Wk', 'Community_Wellbeing');
    insertLesson.run(11, 'Positive Psychology Era', '23:15', 'Martin Seligman on human flourishing and building resilient communities.', 'https://www.youtube.com/embed/9FBxfd7DL3E', 'Community_Wellbeing');
    insertLesson.run(12, 'Inequality & Technology', '10:40', 'Exploring how digital exclusion creates new forms of social inequality.', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Community_Wellbeing');

    // --- AUTOMATIC FILE SCANNING ---
    const baseDir = path.resolve(__dirname, 'Digital Learning');
    const modules = ['Constructivism', 'Digital_SEL', 'Community_Wellbeing'];
    const insertResource = db.prepare("INSERT INTO resources (name, type, week, category, summary, points, blog_url, module) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    const summaries = {
        'Constructivism': 'This research explores how learners actively construct knowledge through cognitive and social frameworks. It provides a foundational understanding of student-centered learning environments.',
        'Digital_SEL': 'An analysis of social-emotional learning competencies in the digital age, focusing on emotional regulation and digital citizenship within virtual spaces.',
        'Community_Wellbeing': 'Investigating collective flourishing through the lens of the Capability Approach, focusing on digital inclusion and social justice in educational communities.'
    };

    const keyPoints = {
        'Constructivism': 'Knowledge Construction,Schema Theory,Social Mediation,Active Discovery',
        'Digital_SEL': 'Self-Regulation,Digital Resilience,Responsible Connectivity,Online Empathy',
        'Community_Wellbeing': 'Capability Deprivation,Social Cohesion,Digital Inclusion,Collective Agency'
    };

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
                    summaries[mod] || `Academic material from the ${mod} folder.`,
                    keyPoints[mod] || "Research,Analysis,Theory",
                    `/blog?id=AUTO`,
                    mod
                );
            });
        }
    });
}

module.exports = db;
