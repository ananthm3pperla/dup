
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const Database = require('@replit/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const db = new Database();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.json());
app.use(express.static('dist'));
app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'hi-bridge-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Auth middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName, role = 'employee' } = req.body;
    
    // Check if user exists
    const existingUser = await db.get(`user:${email}`);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const userId = generateId();
    const hashedPassword = await hashPassword(password);
    
    const userData = {
      id: userId,
      email,
      password: hashedPassword,
      fullName,
      role,
      createdAt: new Date().toISOString(),
      emailConfirmed: false,
      points: 0,
      remoteDays: 0
    };

    await db.set(`user:${email}`, userData);
    await db.set(`user_by_id:${userId}`, userData);

    // Create session
    req.session.userId = userId;
    req.session.userEmail = email;
    req.session.userRole = role;

    res.json({ 
      user: { 
        id: userId, 
        email, 
        fullName, 
        role,
        emailConfirmed: false 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userData = await db.get(`user:${email}`);
    if (!userData) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, userData.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    req.session.userId = userData.id;
    req.session.userEmail = email;
    req.session.userRole = userData.role;

    const { password: _, ...userWithoutPassword } = userData;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const userData = await db.get(`user_by_id:${req.session.userId}`);
    const { password: _, ...userWithoutPassword } = userData;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Team routes
app.post('/api/teams', requireAuth, requireRole(['manager', 'hr']), async (req, res) => {
  try {
    const { name, description, requiredDays, anchorDays } = req.body;
    const teamId = generateId();
    
    const teamData = {
      id: teamId,
      name,
      description,
      requiredDays,
      anchorDays: anchorDays || [],
      createdBy: req.session.userId,
      createdAt: new Date().toISOString(),
      members: [req.session.userId],
      inviteCode: generateId()
    };

    await db.set(`team:${teamId}`, teamData);
    
    // Update user's team
    const userData = await db.get(`user_by_id:${req.session.userId}`);
    userData.teamId = teamId;
    await db.set(`user_by_id:${req.session.userId}`, userData);
    await db.set(`user:${userData.email}`, userData);

    res.json(teamData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

app.post('/api/teams/join', requireAuth, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    // Find team by invite code
    const teams = await db.list('team:');
    let targetTeam = null;
    
    for (const key of teams) {
      const team = await db.get(key);
      if (team.inviteCode === inviteCode) {
        targetTeam = team;
        break;
      }
    }

    if (!targetTeam) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Add user to team
    if (!targetTeam.members.includes(req.session.userId)) {
      targetTeam.members.push(req.session.userId);
      await db.set(`team:${targetTeam.id}`, targetTeam);
    }

    // Update user's team
    const userData = await db.get(`user_by_id:${req.session.userId}`);
    userData.teamId = targetTeam.id;
    await db.set(`user_by_id:${req.session.userId}`, userData);
    await db.set(`user:${userData.email}`, userData);

    res.json(targetTeam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join team' });
  }
});

app.get('/api/teams/my', requireAuth, async (req, res) => {
  try {
    const userData = await db.get(`user_by_id:${req.session.userId}`);
    if (!userData.teamId) {
      return res.json(null);
    }

    const teamData = await db.get(`team:${userData.teamId}`);
    res.json(teamData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get team data' });
  }
});

// Pulse check routes
app.post('/api/pulse', requireAuth, async (req, res) => {
  try {
    const { mood, productivity, collaboration, satisfaction, feedback } = req.body;
    const pulseId = generateId();
    
    const pulseData = {
      id: pulseId,
      userId: req.session.userId,
      mood,
      productivity,
      collaboration,
      satisfaction,
      feedback,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    await db.set(`pulse:${req.session.userId}:${pulseData.date}`, pulseData);
    
    // Award points for pulse check
    const userData = await db.get(`user_by_id:${req.session.userId}`);
    userData.points = (userData.points || 0) + 10;
    await db.set(`user_by_id:${req.session.userId}`, userData);
    await db.set(`user:${userData.email}`, userData);

    res.json(pulseData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit pulse check' });
  }
});

app.get('/api/pulse/today', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const pulseData = await db.get(`pulse:${req.session.userId}:${today}`);
    res.json(pulseData || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get pulse data' });
  }
});

// Check-in routes
app.post('/api/checkins', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const { location } = req.body;
    const checkinId = generateId();
    
    const checkinData = {
      id: checkinId,
      userId: req.session.userId,
      location,
      photoPath: req.file ? req.file.path : null,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    await db.set(`checkin:${checkinId}`, checkinData);
    
    // Award points for office check-in
    const userData = await db.get(`user_by_id:${req.session.userId}`);
    userData.points = (userData.points || 0) + 20;
    userData.remoteDays = (userData.remoteDays || 0) + 1;
    await db.set(`user_by_id:${req.session.userId}`, userData);
    await db.set(`user:${userData.email}`, userData);

    res.json(checkinData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create check-in' });
  }
});

// Schedule routes
app.post('/api/schedule', requireAuth, async (req, res) => {
  try {
    const { date, location, isPlanned } = req.body;
    const scheduleId = generateId();
    
    const scheduleData = {
      id: scheduleId,
      userId: req.session.userId,
      date,
      location,
      isPlanned,
      createdAt: new Date().toISOString()
    };

    await db.set(`schedule:${req.session.userId}:${date}`, scheduleData);
    res.json(scheduleData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

app.get('/api/schedule', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const schedules = await db.list(`schedule:${req.session.userId}:`);
    
    const scheduleData = [];
    for (const key of schedules) {
      const schedule = await db.get(key);
      if (schedule && schedule.date >= startDate && schedule.date <= endDate) {
        scheduleData.push(schedule);
      }
    }

    res.json(scheduleData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get schedule data' });
  }
});

// Analytics routes (for managers and HR)
app.get('/api/analytics/team', requireAuth, requireRole(['manager', 'hr']), async (req, res) => {
  try {
    const userData = await db.get(`user_by_id:${req.session.userId}`);
    const teamData = await db.get(`team:${userData.teamId}`);
    
    if (!teamData) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get team member data
    const members = [];
    for (const memberId of teamData.members) {
      const member = await db.get(`user_by_id:${memberId}`);
      if (member) {
        const { password: _, ...memberWithoutPassword } = member;
        members.push(memberWithoutPassword);
      }
    }

    // Get recent pulse data
    const pulseData = [];
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    for (const memberId of teamData.members) {
      for (const date of last7Days) {
        const pulse = await db.get(`pulse:${memberId}:${date}`);
        if (pulse) {
          pulseData.push(pulse);
        }
      }
    }

    res.json({
      team: teamData,
      members,
      pulseData,
      totalMembers: members.length,
      avgMood: pulseData.length > 0 ? pulseData.reduce((acc, p) => acc + p.mood, 0) / pulseData.length : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics data' });
  }
});

// Leaderboard route
app.get('/api/leaderboard', requireAuth, async (req, res) => {
  try {
    const userData = await db.get(`user_by_id:${req.session.userId}`);
    const teamData = await db.get(`team:${userData.teamId}`);
    
    if (!teamData) {
      return res.json([]);
    }

    const leaderboard = [];
    for (const memberId of teamData.members) {
      const member = await db.get(`user_by_id:${memberId}`);
      if (member) {
        leaderboard.push({
          id: member.id,
          fullName: member.fullName,
          points: member.points || 0,
          remoteDays: member.remoteDays || 0
        });
      }
    }

    leaderboard.sort((a, b) => b.points - a.points);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard data' });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hi-Bridge server running on port ${PORT}`);
});
