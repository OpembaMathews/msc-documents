const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'nexus.db');
const db = new Database(dbPath);

// --- 1. TABLE INITIALIZATION ---
db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    level TEXT,
    current_view TEXT DEFAULT 'dashboard',
    current_lesson_id INTEGER DEFAULT 1,
    last_mood TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS landing_stats (id INTEGER PRIMARY KEY, label TEXT, value TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS personas (id INTEGER PRIMARY KEY, title TEXT, description TEXT, icon TEXT, cta_text TEXT, target_view TEXT, color_class TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS features (id INTEGER PRIMARY KEY, title TEXT, description TEXT, icon TEXT, bg_class TEXT, text_class TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS mood_quotes (mood_key TEXT PRIMARY KEY, quote TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS lessons (id INTEGER PRIMARY KEY, title TEXT, duration TEXT, description TEXT, video_url TEXT, module TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    week TEXT,
    category TEXT,
    summary TEXT,
    points TEXT,
    blog_url TEXT,
    module TEXT,
    file_path TEXT UNIQUE
)`);

// --- 2. SYNC LOGIC ---
function syncResources() {
    console.log('🔄 Syncing research documents...');
    const baseDir = path.resolve(__dirname, 'Digital Learning');
    const modules = ['Constructivism', 'Digital_SEL', 'Community_Wellbeing'];
    
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

    // Get current files to handle deletions
    const existingFiles = db.prepare("SELECT file_path FROM resources").all().map(r => r.file_path);
    const foundFiles = [];

    modules.forEach(mod => {
        const modPath = path.join(baseDir, mod);
        if (fs.existsSync(modPath)) {
            const files = fs.readdirSync(modPath);
            files.forEach(file => {
                if (file.startsWith('.') || file.endsWith('.db') || file.endsWith('.js')) return;
                
                const fullPath = path.join(modPath, file);
                foundFiles.push(fullPath);
                
                const ext = path.extname(file).replace('.', '');
                const fileName = path.basename(file, path.extname(file)).replace(/_/g, ' ');

                db.prepare(`
                    INSERT INTO resources (name, type, week, category, summary, points, blog_url, module, file_path)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(file_path) DO UPDATE SET
                        name = excluded.name,
                        type = excluded.type
                `).run(
                    fileName,
                    ext,
                    "01-14",
                    "reading",
                    summaries[mod] || `Academic material from the ${mod} folder.`,
                    keyPoints[mod] || "Research,Analysis,Theory",
                    `/blog?id=AUTO`,
                    mod,
                    fullPath
                );
            });
        }
    });

    // Remove records for files that no longer exist
    existingFiles.forEach(oldFile => {
        if (!foundFiles.includes(oldFile)) {
            db.prepare("DELETE FROM resources WHERE file_path = ?").run(oldFile);
        }
    });

    console.log(`✅ Sync complete. ${foundFiles.length} documents indexed.`);
}

// --- 3. SEEDING (One-time only for static data) ---
const userCount = db.prepare("SELECT count(*) as count FROM users").get().count;
if (userCount === 0) {
    db.prepare("INSERT INTO users (name, level) VALUES (?, ?)").run("Graduate Scholar", "Master");
    db.prepare("INSERT INTO landing_stats (label, value) VALUES ('Wellbeing Checks', '5,000+'), ('Research Modules', '25+'), ('Student Engagement', '98%'), ('Digital Support', '24/7')").run();

    const insertPersona = db.prepare("INSERT INTO personas (title, description, icon, cta_text, target_view, color_class) VALUES (?,?,?,?,?,?)");
    insertPersona.run("For Students", "Personalized emotional tracking.", "graduation-cap", "Start as Student", "checkin", "text-indigo-600");
    
    const insertFeature = db.prepare("INSERT INTO features (title, description, icon, bg_class, text_class) VALUES (?,?,?,?,?)");
    insertFeature.run("Psychology of Well-being", "Research on mental health.", "brain", "bg-indigo-50", "text-indigo-600");

    const insertLesson = db.prepare("INSERT INTO lessons (id, title, duration, description, video_url, module) VALUES (?, ?, ?, ?, ?, ?)");
    insertLesson.run(1, 'Piaget vs. Vygotsky', '03:45', 'Cognitive vs Social.', 'https://www.youtube.com/embed/yY-SXMzajH0', 'Constructivism');
    // ... other lessons would be seeded here similarly
    
    syncResources();
}

module.exports = { db, syncResources };
