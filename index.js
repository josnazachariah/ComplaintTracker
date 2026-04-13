const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processComplaint } = require('./ai-service');

const app = express();
const PORT = 5000;

// Auth Config
const ADMIN_EMAIL = 'admin@city.gov';
const ADMIN_PASS = 'admin123';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Ensure db file exists
const DB_FILE = path.join(__dirname, 'db.json');
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ complaints: [] }, null, 2));
}

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Helpers
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Routes

// Login route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Check for Admin
    if (email === ADMIN_EMAIL) {
        if (password === ADMIN_PASS) {
            return res.json({ success: true, role: 'admin', email: ADMIN_EMAIL });
        } else {
            return res.status(401).json({ success: false, message: 'Incorrect admin password' });
        }
    }

    // Default to Citizen for any other email
    if (email && email.includes('@')) {
        return res.json({ success: true, role: 'citizen', email });
    }

    res.status(400).json({ success: false, message: 'Please enter a valid email address' });
});

// Get all complaints
app.get('/api/complaints', (req, res) => {
    const db = readDB();
    res.json(db.complaints);
});

// Submit a complaint
app.post('/api/complaints', upload.single('image'), (req, res) => {
    const { title, description, citizenName, location, category } = req.body;
    const db = readDB();

    const aiResults = processComplaint({ description, category });

    const newComplaint = {
        id: `COMP-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        description,
        citizenName: citizenName || 'Anonymous',
        image: req.file ? `/uploads/${req.file.filename}` : null,
        location: JSON.parse(location), // Expecting { lat, lng, address }
        category: aiResults.detectedCategory,
        confidence: aiResults.confidence,
        priority: aiResults.priority,
        emergencyScore: aiResults.emergencyScore,
        reasoning: aiResults.reasoning,
        department: aiResults.department,
        status: 'Pending',
        timestamp: new Date().toISOString()
    };

    db.complaints.push(newComplaint);
    writeDB(db);

    res.status(201).json(newComplaint);
});

// Update complaint status
app.patch('/api/complaints/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = readDB();

    const index = db.complaints.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).send('Complaint not found');

    db.complaints[index].status = status;
    writeDB(db);

    res.json(db.complaints[index]);
});

// Get Stats
app.get('/api/stats', (req, res) => {
    const db = readDB();
    const complaints = db.complaints;

    const stats = {
        total: complaints.length,
        byCategory: {},
        byDepartment: {},
        highPriority: complaints.filter(c => c.priority === 'High').length,
        statusCounts: {
            Pending: complaints.filter(c => c.status === 'Pending').length,
            'In Progress': complaints.filter(c => c.status === 'In Progress').length,
            Resolved: complaints.filter(c => c.status === 'Resolved').length,
        }
    };

    complaints.forEach(c => {
        stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1;
        stats.byDepartment[c.department] = (stats.byDepartment[c.department] || 0) + 1;
    });

    res.json(stats);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
