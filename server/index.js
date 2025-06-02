const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('dist'));

// In-memory storage (replace with Replit Database in production)
let users = [];
let sessions = new Map();

// Helper functions
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

// Auth middleware
function requireAuth(req, res, next) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);

  if (!session || session.expires < Date.now()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = session.user;
  next();
}

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = {
    id: crypto.randomUUID(),
    email,
    password: hashPassword(password),
    user_metadata: {
      full_name: full_name || email.split('@')[0],
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name || email)}&background=random`
    },
    created_at: new Date().toISOString()
  };

  users.push(user);

  // Create session
  const sessionId = generateSessionId();
  const session = {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata
    },
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  sessions.set(sessionId, session);

  res.json({
    user: session.user,
    session: { id: sessionId, expires_at: new Date(session.expires).toISOString() }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = users.find(u => u.email === email && u.password === hashPassword(password));

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Create session
  const sessionId = generateSessionId();
  const session = {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata
    },
    expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  sessions.set(sessionId, session);

  res.json({
    user: session.user,
    session: { id: sessionId, expires_at: new Date(session.expires).toISOString() }
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ success: true });
});

app.post('/api/auth/refresh', requireAuth, (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);

  if (session) {
    // Extend session
    session.expires = Date.now() + (24 * 60 * 60 * 1000);
    res.json({
      session: {
        user: session.user,
        expires_at: new Date(session.expires).toISOString()
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid session' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hi-Bridge server running on port ${PORT}`);
  console.log('API endpoints:');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/auth/me');
  console.log('  POST /api/auth/logout');
  console.log('  POST /api/auth/refresh');
});