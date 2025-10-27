const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize SQLite database
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'users.db'));

// Create users table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// API endpoint to save email
app.post('/api/save-email', (req, res) => {
    const { email } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid email address' 
        });
    }

    try {
        // Insert email into database
        const stmt = db.prepare('INSERT INTO users (email) VALUES (?)');
        const result = stmt.run(email);

        res.json({ 
            success: true, 
            message: 'Email saved successfully',
            id: result.lastInsertRowid
        });
    } catch (error) {
        // Handle duplicate email
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE')) {
            return res.json({ 
                success: true, 
                message: 'Email already registered' 
            });
        }

        console.error('Database error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save email' 
        });
    }
});

// API endpoint to get all emails (for admin purposes)
app.get('/api/users', (req, res) => {
    try {
        const users = db.prepare('SELECT id, email, created_at FROM users ORDER BY created_at DESC').all();
        res.json({ success: true, users });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve users' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database location: ${path.join(dbDir, 'users.db')}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});
