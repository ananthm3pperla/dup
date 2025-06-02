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

// Serve built React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
}

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
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    await db.set(`team:${team.id}`, team);
    await db.set(`invite:${team.inviteCode}`, team.id);

    res.json({ team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/teams/my', async (req, res) => {
  try {
    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get all teams and filter by member
    const allKeys = await db.list();
    const teamKeys = allKeys.filter(key => key.startsWith('team:'));
    const teams = [];

    for (const key of teamKeys) {
      const team = await db.get(key);
      if (team && team.members && team.members.includes(req.session.userId)) {
        teams.push(team);
      }
    }

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/teams/join', async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const teamId = await db.get(`invite:${inviteCode}`);
    if (!teamId) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    const team = await db.get(`team:${teamId}`);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (!team.members.includes(req.session.userId)) {
      team.members.push(req.session.userId);
      await db.set(`team:${teamId}`, team);
    }

    res.json({ team });
  } catch (error) {
    console.error('Join team error:', error);
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

// Schedule routes
app.post('/api/schedule', async (req, res) => {
  try {
    const { date, workLocation, notes } = req.body;

    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const schedule = {
      id: Date.now().toString(),
      userId: req.session.userId,
      date,
      workLocation,
      notes,
      createdAt: new Date().toISOString()
    };

    await db.set(`schedule:${req.session.userId}:${date}`, schedule);

    res.json({ schedule });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const allKeys = await db.list();
    const scheduleKeys = allKeys.filter(key => 
      key.startsWith(`schedule:${req.session.userId}:`)
    );
    
    const schedules = [];
    for (const key of scheduleKeys) {
      const schedule = await db.get(key);
      if (schedule) schedules.push(schedule);
    }

    res.json({ schedules });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leaderboard endpoint
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get all users and calculate points
    const allKeys = await db.list();
    const userKeys = allKeys.filter(key => key.startsWith('user:'));
    const pulseKeys = allKeys.filter(key => key.startsWith('pulse:'));
    const checkinKeys = allKeys.filter(key => key.startsWith('checkin:'));
    const leaderboard = [];

    for (const key of userKeys) {
      const user = await db.get(key);
      if (user) {
        // Calculate points based on activity
        let userPulseCount = 0;
        let userCheckinCount = 0;

        // Count user's pulse checks
        for (const pulseKey of pulseKeys) {
          const pulse = await db.get(pulseKey);
          if (pulse && pulse.userId === user.id) {
            userPulseCount++;
          }
        }

        // Count user's check-ins
        for (const checkinKey of checkinKeys) {
          const checkin = await db.get(checkinKey);
          if (checkin && checkin.userId === user.id) {
            userCheckinCount++;
          }
        }
        
        const points = (userPulseCount * 10) + (userCheckinCount * 25);
        
        leaderboard.push({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          points: points
        });
      }
    }

    leaderboard.sort((a, b) => b.points - a.points);

    res.json({ leaderboard: leaderboard.slice(0, 10) });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics endpoints
app.get('/api/analytics/team', async (req, res) => {
  try {
    if (!req.session.userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await db.get(`user:${req.session.userEmail}`);
    if (!user || (user.role !== 'manager' && user.role !== 'hr')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get analytics data
    const allKeys = await db.list();
    const pulseKeys = allKeys.filter(key => key.startsWith('pulse:'));
    const checkinKeys = allKeys.filter(key => key.startsWith('checkin:'));
    
    const pulseData = [];
    const checkinData = [];

    for (const key of pulseKeys) {
      const pulse = await db.get(key);
      if (pulse) pulseData.push(pulse);
    }

    for (const key of checkinKeys) {
      const checkin = await db.get(key);
      if (checkin) checkinData.push(checkin);
    }

    const analytics = {
      totalPulseChecks: pulseData.length,
      totalCheckins: checkinData.length,
      averageRating: pulseData.length > 0 
        ? pulseData.reduce((sum, p) => sum + (p.rating || 0), 0) / pulseData.length 
        : 0,
      officeAttendance: checkinData.filter(c => c.workType === 'office').length,
      remoteWork: checkinData.filter(c => c.workType === 'remote').length
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve React app
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    res.json({ message: 'Hi-Bridge API running in development mode' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hi-Bridge server running on port ${PORT}`);
});