const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limiting for email endpoint
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 email submissions per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Serve only public static files (not the entire directory)
const publicFiles = ['index.html', 'style.css', 'script.js', 'lib'];
publicFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        if (fs.statSync(filePath).isDirectory()) {
            app.use(`/${file}`, limiter, express.static(filePath));
        } else {
            app.get(`/${file}`, limiter, (req, res) => {
                res.sendFile(filePath);
            });
        }
    }
});

// Serve index.html at root
app.get('/', limiter, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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

// Improved email validation - simpler regex to avoid ReDoS
function isValidEmail(email) {
    // Simple email validation that's safe from ReDoS
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    // Basic length check
    if (email.length > 254) {
        return false;
    }
    
    // Split and validate parts
    const parts = email.split('@');
    if (parts.length !== 2) {
        return false;
    }
    
    const [localPart, domain] = parts;
    
    // Validate local part and domain
    if (!localPart || localPart.length > 64 || !domain || domain.length > 253) {
        return false;
    }
    
    // Simple character validation
    const localPartRegex = /^[a-zA-Z0-9._+-]+$/;
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return localPartRegex.test(localPart) && domainRegex.test(domain);
}

// API endpoint to save email (with rate limiting)
app.post('/api/save-email', emailLimiter, (req, res) => {
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

// API endpoint to get all emails (for admin purposes, with rate limiting)
app.get('/api/users', emailLimiter, (req, res) => {
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
