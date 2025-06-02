# github-3kpsmupx

Repository created by Bolt to GitHub extension

# Hi-Bridge - Hybrid Work Engagement Platform

Hi-Bridge is a comprehensive web-based platform designed to encourage in-office participation through gamification, team competitions, and engagement tracking. The platform has been fully migrated from Supabase to run natively on Replit's infrastructure.

## 🚀 Key Features

### User Roles & Permissions

- **Employees**: Daily pulse checks, office check-ins, points earning, schedule management
- **Managers**: Team analytics, anchor day scheduling, engagement heatmaps
- **HR Leaders**: Policy compliance, attendance analytics, configuration tools

### Core Functionality

- **Anchor Day Scheduling**: Managers set team anchor days; employees vote on preferred days
- **Daily Pulse Checks**: Employee feedback surveys to track morale and engagement
- **Gamification System**: Points for participation with team leaderboards
- **Office Check-ins**: Photo-based verification with bonus points
- **Analytics Dashboards**: Role-specific insights and reporting

### Hi-Bridge Games (Beta)

- Team photo competitions
- Bonus point challenges
- Local business-sponsored rewards
- Public leaderboards

## 🛠️ Architecture

### Backend

- **Express.js** server with session-based authentication
- **Replit Database** for data persistence (Key-Value store)
- **Multer** for file upload handling
- **bcryptjs** for password hashing

### Frontend

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation

## 🔧 Development Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📁 Project Structure

```
├── server/
│   └── index.js              # Express server with API routes
├── src/
│   ├── components/           # Reusable React components
│   ├── contexts/            # React context providers
│   ├── lib/                 # Utility functions and API calls
│   ├── pages/               # Page components
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── uploads/                 # File upload directory
└── docs/                    # Documentation
```

## 🔐 Authentication & Security

- Custom session-based authentication using Express sessions
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- CSRF protection through session management

## 📊 Database Schema

The application uses Replit's Key-Value database with the following key patterns:

- `user:{email}` - User data by email
- `user_by_id:{userId}` - User data by ID
- `team:{teamId}` - Team information
- `pulse:{userId}:{date}` - Daily pulse check data
- `checkin:{checkinId}` - Office check-in records
- `schedule:{userId}:{date}` - User schedule data

## 🎮 Gamification System

### Point Structure

- Daily pulse check: 10 points
- Office check-in: 20 points
- Team participation bonuses
- Hi-Bridge Games rewards

### Leaderboards

- Team-based rankings
- Individual achievement tracking
- Monthly competitions

## 🚀 Deployment

The application is designed to run on Replit's infrastructure:

1. Push code to Replit
2. Environment variables are configured in `.env`
3. Click "Run" to start the development server
4. Use Replit's deployment features for production

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Team Management

- `POST /api/teams` - Create team (Manager/HR only)
- `POST /api/teams/join` - Join team with invite code
- `GET /api/teams/my` - Get user's team

### Engagement Features

- `POST /api/pulse` - Submit daily pulse check
- `GET /api/pulse/today` - Get today's pulse check
- `POST /api/checkins` - Submit office check-in
- `POST /api/schedule` - Update work schedule
- `GET /api/schedule` - Get schedule data

### Analytics

- `GET /api/analytics/team` - Team analytics (Manager/HR only)
- `GET /api/leaderboard` - Team leaderboard

## 🔄 Migration from Supabase

This platform was successfully migrated from Supabase to Replit:

- ✅ PostgreSQL → Replit Database (Key-Value)
- ✅ Supabase Auth → Express sessions
- ✅ Real-time features → Polling/WebSockets
- ✅ File storage → Replit filesystem
- ✅ External dependencies eliminated

## 🤝 Contributing

1. Follow the established code patterns
2. Use TypeScript for type safety
3. Add JSDoc comments for functions
4. Write tests for new features
5. Follow SOLID principles

## 📞 Support

For issues or questions about Hi-Bridge, please refer to the documentation in the `/docs` folder or create an issue in the project repository.
