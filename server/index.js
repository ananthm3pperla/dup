import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from '@replit/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const db = new Database();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'hibridge-dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));
app.use(express.static('dist'));

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await db.get(`user:${email}`);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || 'employee',
      createdAt: new Date().toISOString()
    };

    await db.set(`user:${email}`, user);

    // Set session
    req.session.userId = user.id;
    req.session.userEmail = user.email;

    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const user = await db.get(`user:${email}`);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.userEmail = user.email;

    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await db.get(`user:${req.session.userEmail}`);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Team routes
app.post('/api/teams', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const team = {
      id: Date.now().toString(),
      name,
      description,
      leaderId: req.session.userId,
      members: [req.session.userId],
      createdAt: new Date().toISOString()
    };

    await db.set(`team:${team.id}`, team);

    res.json({ team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pulse check routes
app.post('/api/pulse', async (req, res) => {
  try {
    const { rating, mood, feedback, workLocation } = req.body;

    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const pulse = {
      id: Date.now().toString(),
      userId: req.session.userId,
      rating,
      mood,
      feedback,
      workLocation,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    await db.set(`pulse:${pulse.id}`, pulse);

    res.json({ pulse });
  } catch (error) {
    console.error('Pulse check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-in routes
app.post('/api/checkin', upload.single('photo'), async (req, res) => {
  try {
    const { location, workType, notes } = req.body;

    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const checkin = {
      id: Date.now().toString(),
      userId: req.session.userId,
      location,
      workType,
      notes,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      timestamp: new Date().toISOString()
    };

    await db.set(`checkin:${checkin.id}`, checkin);

    res.json({ checkin });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hi-Bridge server running on port ${PORT}`);
});