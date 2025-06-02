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
export type UserRole = 'employee' | 'manager' | 'hr' | 'admin';
export type WorkLocation = 'office' | 'remote' | 'hybrid';

export interface User extends BaseEntity {
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

// Team types
export interface Team extends BaseEntity {
  name: string;
  description: string;
  leaderId: string;
  members: string[];
  inviteCode: string;
  settings: TeamSettings;
  stats: TeamStats;
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

// Pulse check types
export type MoodType = 'excellent' | 'good' | 'okay' | 'poor' | 'terrible';

export interface PulseCheck extends BaseEntity {
  userId: string;
  rating: number; // 1-5
  mood: MoodType;
  feedback?: string;
  workLocation: WorkLocation;
  date: string;
  tags?: string[];
}

// Check-in types
export interface CheckIn extends BaseEntity {
  userId: string;
  location: string;
  workType: WorkLocation;
  notes?: string;
  photoUrl?: string;
  timestamp: string;
  isVerified: boolean;
  verificationMethod?: 'photo' | 'location' | 'manual';
}

// Schedule types
export interface Schedule extends BaseEntity {
  userId: string;
  date: string;
  workLocation: WorkLocation;
  notes?: string;
  isConfirmed: boolean;
  teamId?: string;
}

// Rewards types
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