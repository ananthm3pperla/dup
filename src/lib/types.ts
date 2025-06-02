/**
 * Core types for Hi-Bridge application
 * Updated for Replit Database integration
 */

// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "employee" | "manager" | "hr";
  teamId?: string;
  createdAt: string;
  lastActive: string;
  avatar?: string;
  location?: string;
  isActive: boolean;
  emailVerified?: boolean;
  lastLogin?: string;
}

export interface UserProfile extends User {
  bio?: string;
  phoneNumber?: string;
  workPreferences?: WorkPreferences;
  skills?: string[];
  department?: string;
  startDate?: string;
}

export interface WorkPreferences {
  preferredWorkDays: string[];
  preferredLocation: "office" | "remote" | "hybrid";
  flexibleSchedule: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Team types
export interface Team {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  memberIds: string[];
  settings: TeamSettings;
  createdAt: string;
  updatedAt?: string;
}

export interface TeamSettings {
  anchorDays: string[];
  pulseEnabled: boolean;
  gamificationEnabled: boolean;
  allowRemoteWork: boolean;
  requireCheckIn: boolean;
  maxRemoteDaysPerWeek?: number;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: "member" | "lead" | "manager";
  joinedAt: string;
  isActive: boolean;
}

// Schedule types
export interface WorkSchedule {
  id: string;
  userId: string;
  teamId: string;
  date: string;
  location: "office" | "remote" | "hybrid";
  isAnchorDay: boolean;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnchorDay {
  id: string;
  teamId: string;
  date: string;
  votesFor: string[];
  votesAgainst: string[];
  isConfirmed: boolean;
  createdBy: string;
  createdAt: string;
}

// Pulse check types
export interface PulseCheck {
  id: string;
  userId: string;
  teamId: string;
  rating: number; // 1-5 scale
  comment?: string;
  date: string;
  submittedAt: string;
  mood?: "great" | "good" | "okay" | "poor" | "terrible";
  workload?: "light" | "moderate" | "heavy" | "overwhelming";
  satisfaction?: number; // 1-10 scale
}

export interface PulseAnalytics {
  averageRating: number;
  totalResponses: number;
  trendDirection: "up" | "down" | "stable";
  responseRate: number;
  dateRange: {
    start: string;
    end: string;
  };
}

// Check-in types
export interface CheckIn {
  id: string;
  userId: string;
  teamId: string;
  location: "office" | "remote";
  timestamp: string;
  photoUrl?: string;
  verified: boolean;
  points: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface CheckInVerification {
  id: string;
  checkInId: string;
  method: "photo" | "location" | "manual";
  status: "pending" | "verified" | "rejected";
  verifiedBy?: string;
  verifiedAt?: string;
  reason?: string;
}

// Gamification types
export interface UserPoints {
  id: string;
  userId: string;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastUpdated: string;
  level: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedAt?: string;
}

export interface Leaderboard {
  id: string;
  teamId: string;
  period: "weekly" | "monthly" | "quarterly";
  entries: LeaderboardEntry[];
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  userFullName: string;
  userAvatar?: string;
  points: number;
  rank: number;
  badges: number;
  checkIns: number;
}

// Rewards types
export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: "time_off" | "perks" | "recognition" | "wellness";
  isActive: boolean;
  imageUrl?: string;
  expiryDate?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  redeemedAt: string;
  status: "pending" | "approved" | "rejected" | "used";
  notes?: string;
}

// Analytics types
export interface TeamAnalytics {
  teamId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalMembers: number;
    activeMembers: number;
    officeAttendance: number;
    remoteWork: number;
    averagePulseRating: number;
    pulseResponseRate: number;
    totalCheckIns: number;
    averagePointsPerMember: number;
  };
  trends: {
    attendanceTrend: "up" | "down" | "stable";
    pulseTrend: "up" | "down" | "stable";
    engagementTrend: "up" | "down" | "stable";
  };
}

export interface AttendanceMetric {
  date: string;
  officeCount: number;
  remoteCount: number;
  totalMembers: number;
  attendanceRate: number;
}

// Session types
export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
  userAgent?: string;
  ipAddress?: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: "pulse_reminder" | "team_update" | "achievement" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupForm {
  email: string;
  password: string;
  fullName: string;
  role?: "employee" | "manager" | "hr";
  teamCode?: string;
}

export interface TeamCreationForm {
  name: string;
  description?: string;
  settings: TeamSettings;
}

// Database query types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  filters?: Record<string, any>;
}

// Event types for real-time updates
export interface TeamEvent {
  type:
    | "member_joined"
    | "member_left"
    | "schedule_updated"
    | "pulse_submitted";
  teamId: string;
  userId: string;
  data: any;
  timestamp: string;
}

export interface SystemEvent {
  type: "maintenance" | "update" | "announcement";
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

// Theme types
export interface ThemeConfig {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
  borderRadius: "none" | "sm" | "md" | "lg";
  fontSize: "sm" | "md" | "lg";
}

// Configuration types
export interface AppConfig {
  features: {
    gamification: boolean;
    faceRecognition: boolean;
    aiInsights: boolean;
    betaMode: boolean;
  };
  limits: {
    maxTeamSize: number;
    maxRemoteDaysPerWeek: number;
    pulseCheckCooldown: number; // hours
    checkInRadius: number; // meters
  };
  integrations: {
    calendar: boolean;
    slack: boolean;
    teams: boolean;
  };
}

// Basic types for Hi-Bridge application
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'employee' | 'manager' | 'hr_admin';
  teamId?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user_metadata?: {
    full_name?: string;
  };
}

export default {};