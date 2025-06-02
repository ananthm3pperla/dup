import express from 'express';
import path from 'path';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkg from '@replit/database';
const Database = pkg.default || pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const db = new Database();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.session?.userId || 'anonymous'}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Utility functions
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'hibridge-dev-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const userData = await db.get(`user:${req.session.userId}`);
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = JSON.parse(userData);
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, role = 'employee' } = req.body;

    // Check if user already exists
    const existingUserId = await db.get(`user:email:${email}`);
    if (existingUserId) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = generateId();

    const user = {
      id: userId,
      email,
      fullName,
      role,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true
    };

    await db.set(`user:${userId}`, JSON.stringify(user));
    await db.set(`user:email:${email}`, userId);
    await db.set(`user:password:${userId}`, hashedPassword);

    req.session.userId = userId;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userId = await db.get(`user:email:${email}`);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userData = await db.get(`user:${userId}`);
    const storedHash = await db.get(`user:password:${userId}`);

    if (!userData || !storedHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, storedHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = JSON.parse(userData);
    user.lastActive = new Date().toISOString();
    await db.set(`user:${userId}`, JSON.stringify(user));

    req.session.userId = userId;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        teamId: user.teamId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const userData = await db.get(`user:${req.session.userId}`);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = JSON.parse(userData);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        teamId: user.teamId,
        avatar: user.avatar,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.post('/api/auth/refresh', requireAuth, (req, res) => {
  res.json({ message: 'Session refreshed' });
});

// Team routes
app.post('/api/teams', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const teamId = generateId();

    const team = {
      id: teamId,
      name,
      description: description || '',
      managerId: req.session.userId,
      memberIds: [req.session.userId],
      settings: {
        anchorDays: [],
        pulseEnabled: true,
        gamificationEnabled: true
      },
      createdAt: new Date().toISOString()
    };

    await db.set(`team:${teamId}`, JSON.stringify(team));

    // Update user's team
    const userData = await db.get(`user:${req.session.userId}`);
    const user = JSON.parse(userData);
    user.teamId = teamId;
    await db.set(`user:${req.session.userId}`, JSON.stringify(user));

    res.json({ team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Failed to create team' });
  }
});

app.get('/api/teams/my', requireAuth, async (req, res) => {
  try {
    const userData = await db.get(`user:${req.session.userId}`);
    const user = JSON.parse(userData);

    if (!user.teamId) {
      return res.json({ teams: [] });
    }

    const teamData = await db.get(`team:${user.teamId}`);
    const team = teamData ? JSON.parse(teamData) : null;

    res.json({ teams: team ? [team] : [] });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Failed to get teams' });
  }
});

app.post('/api/teams/join', requireAuth, async (req, res) => {
  try {
    const { inviteCode } = req.body;

    // For demo purposes, any invite code works - in production, implement proper invite system
    const teamId = inviteCode;
    const teamData = await db.get(`team:${teamId}`);

    if (!teamData) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    const team = JSON.parse(teamData);
    if (!team.memberIds.includes(req.session.userId)) {
      team.memberIds.push(req.session.userId);
      await db.set(`team:${teamId}`, JSON.stringify(team));
    }

    // Update user's team
    const userData = await db.get(`user:${req.session.userId}`);
    const user = JSON.parse(userData);
    user.teamId = teamId;
    await db.set(`user:${req.session.userId}`, JSON.stringify(user));

    res.json({ team });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ message: 'Failed to join team' });
  }
});

// Pulse check routes
app.post('/api/pulse', requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const pulseId = generateId();

    const userData = await db.get(`user:${req.session.userId}`);
    const user = JSON.parse(userData);

    const pulseCheck = {
      id: pulseId,
      userId: req.session.userId,
      teamId: user.teamId,
      rating,
      comment: comment || '',
      date: today,
      submittedAt: new Date().toISOString()
    };

    await db.set(`pulse:${pulseId}`, JSON.stringify(pulseCheck));
    await db.set(`pulse:user:${req.session.userId}:${today}`, pulseId);

    res.json({ pulseCheck });
  } catch (error) {
    console.error('Create pulse check error:', error);
    res.status(500).json({ message: 'Failed to submit pulse check' });
  }
});

app.get('/api/pulse/today', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const pulseId = await db.get(`pulse:user:${req.session.userId}:${today}`);

    if (!pulseId) {
      return res.json({ pulseCheck: null });
    }

    const pulseData = await db.get(`pulse:${pulseId}`);
    const pulseCheck = pulseData ? JSON.parse(pulseData) : null;

    res.json({ pulseCheck });
  } catch (error) {
    console.error('Get pulse check error:', error);
    res.status(500).json({ message: 'Failed to get pulse check' });
  }
});

// Check-in routes
app.post('/api/checkins', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const { location } = req.body;
    const checkInId = generateId();

    const userData = await db.get(`user:${req.session.userId}`);
    const user = JSON.parse(userData);

    const checkIn = {
      id: checkInId,
      userId: req.session.userId,
      teamId: user.teamId,
      location: location || 'office',
      timestamp: new Date().toISOString(),
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      verified: true,
      points: location === 'office' ? 10 : 5
    };

    await db.set(`checkin:${checkInId}`, JSON.stringify(checkIn));

    res.json({ checkIn });
  } catch (error) {
    console.error('Create check-in error:', error);
    res.status(500).json({ message: 'Failed to create check-in' });
  }
});

// Schedule routes
app.post('/api/schedule', requireAuth, async (req, res) => {
  try {
    const { schedule } = req.body;
    const scheduleId = generateId();

    const scheduleData = {
      id: scheduleId,
      userId: req.session.userId,
      schedule,
      updatedAt: new Date().toISOString()
    };

    await db.set(`schedule:${req.session.userId}`, JSON.stringify(scheduleData));

    res.json({ schedule: scheduleData });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Failed to update schedule' });
  }
});

app.get('/api/schedule', requireAuth, async (req, res) => {
  try {
    const scheduleData = await db.get(`schedule:${req.session.userId}`);
    const schedule = scheduleData ? JSON.parse(scheduleData) : null;

    res.json({ schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Failed to get schedule' });
  }
});

// Analytics routes
app.get('/api/analytics/team', requireAuth, requireRole(['manager', 'hr']), async (req, res) => {
  try {
    const userData = await db.get(`user:${req.session.userId}`);
    const user = JSON.parse(userData);

    if (!user.teamId) {
      return res.json({ analytics: {} });
    }

    // Get team pulse checks for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const keys = await db.list('pulse:');
    const teamPulses = [];

    for (const key of keys) {
      if (key.startsWith('pulse:user:')) continue; // Skip user mapping keys
      const pulseData = await db.get(key);
      if (pulseData) {
        const pulse = JSON.parse(pulseData);
        if (pulse.teamId === user.teamId && pulse.date >= thirtyDaysAgo && pulse.date <= today) {
          teamPulses.push(pulse);
        }
      }
    }

    const analytics = {
      totalResponses: teamPulses.length,
      averageRating: teamPulses.length > 0 ? 
        teamPulses.reduce((sum, p) => sum + p.rating, 0) / teamPulses.length : 0,
      responseRate: 0.85, // Mock data
      trends: teamPulses.map(p => ({ date: p.date, rating: p.rating }))
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to get analytics' });
  }
});

// Leaderboard routes
app.get('/api/leaderboard', requireAuth, async (req, res) => {
  try {
    const userData = await db.get(`user:${req.session.userId}`);
    const user = JSON.parse(userData);

    if (!user.teamId) {
      return res.json({ leaderboard: [] });
    }

    // Get team data
    const teamData = await db.get(`team:${user.teamId}`);
    const team = JSON.parse(teamData);

    // Calculate points for each team member (mock data for now)
    const leaderboard = await Promise.all(team.memberIds.map(async (memberId) => {
      const memberData = await db.get(`user:${memberId}`);
      const member = JSON.parse(memberData);

      // Mock points calculation
      const points = Math.floor(Math.random() * 1000) + 100;

      return {
        userId: member.id,
        name: member.fullName,
        points,
        rank: 0
      };
    }));

    // Sort by points and assign ranks
    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to get leaderboard' });
  }
});

// Serve React app for all other routes (only in production)
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    res.status(404).json({ message: 'API route not found' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hi-Bridge server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});