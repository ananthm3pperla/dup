export type TabType = 'experience' | 'education' | 'team' | 'activity';

export interface TabComponentProps {
  profile: Employee;
  canEdit?: boolean;
  isSaving?: boolean;
  onAdd?: () => void;
  onSave?: (index: number, data: any) => void;
  onDelete?: (index: number) => void;
  onNodeClick?: (id: string) => void;
}

// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'employee' | 'manager' | 'hr';
  teamId?: string;
  createdAt: string;
  lastActive: string;
  avatar?: string;
  location?: string;
  isActive: boolean;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  memberIds: string[];
  settings: {
    anchorDays: string[];
    pulseEnabled: boolean;
    gamificationEnabled: boolean;
  };
  createdAt: string;
}

export interface PulseCheck {
  id: string;
  userId: string;
  teamId: string;
  rating: number;
  comment?: string;
  date: string;
  submittedAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  teamId: string;
  location: 'office' | 'remote';
  timestamp: string;
  photoUrl?: string;
  verified: boolean;
  points: number;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role?: 'employee' | 'manager' | 'hr';
  teamId?: string;
  emailVerified: boolean;
  lastSignIn?: string;
}

export interface AuthSession {
  user: AuthUser;
  sessionId: string;
  expiresAt: number;
}

export type UserRole = 'employee' | 'manager' | 'hr' | 'admin';
export type WorkLocation = 'office' | 'remote' | 'hybrid';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  workPreferences: WorkPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  teamUpdates: boolean;
  pulseReminders: boolean;
  achievementAlerts: boolean;
}

export interface WorkPreferences {
  preferredWorkLocation: WorkLocation;
  preferredOfficeeDays: string[];
  timeZone: string;
  workingHours: {
    start: string;
    end: string;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  activityVisibility: 'public' | 'team' | 'private';
  shareCalendar: boolean;
}

export interface TeamSettings {
  requiredOfficeDays: number;
  anchorDays: string[];
  allowFlexibility: boolean;
  pulseCheckFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  averagePulseRating: number;
  officeAttendanceRate: number;
}

export type MoodType = 'excellent' | 'good' | 'okay' | 'poor' | 'terrible';

export interface Reward extends BaseEntity {
  name: string;
  description: string;
  cost: number;
  category: 'remote_day' | 'perk' | 'achievement' | 'custom';
  isActive: boolean;
  imageUrl?: string;
  maxRedemptions?: number;
  expiresAt?: string;
}

export interface RewardTransaction extends BaseEntity {
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'approved' | 'denied' | 'used';
  redeemedAt: string;
  usedAt?: string;
  notes?: string;
}

// Analytics types
export interface AnalyticsData {
  totalPulseChecks: number;
  totalCheckins: number;
  averageRating: number;
  officeAttendance: number;
  remoteWork: number;
  teamEngagement: number;
  trends: {
    period: string;
    data: AnalyticsDataPoint[];
  };
}

export interface AnalyticsDataPoint {
  date: string;
  value: number;
  category: string;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  department?: string;
  jobTitle?: string;
}

export interface TeamCreateForm {
  name: string;
  description: string;
  requiredOfficeDays: number;
  anchorDays: string[];
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Event types
export interface AppEvent {
  type: string;
  data: Record<string, any>;
  timestamp: string;
  userId?: string;
}

export interface Employee extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  jobTitle?: string;
  profilePicture?: string;
  preferences?: UserPreferences;
  isActive: boolean;
  lastLoginAt?: string;
}