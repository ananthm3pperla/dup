// Authentication types already defined in index.ts

// Team types
export type RtoPolicy = {
  required_days: number;
  core_hours?: {
    start: string;
    end: string;
  };
  allowed_work_types: ('office' | 'remote' | 'flexible')[];
  fixed_days?: string[];
};

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  invite_code: string;
  rto_policy: RtoPolicy;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
  user?: any;
}

export interface WorkSchedule {
  id: string;
  user_id: string;
  date: string;
  work_type: 'office' | 'remote' | 'flexible';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamScheduleDay {
  date: string;
  schedules: {
    user_id: string;
    user_name?: string;
    avatar_url?: string;
    work_type: 'office' | 'remote' | 'flexible';
  }[];
  officeMemberCount: number;
  remoteMemberCount: number;
  flexibleMemberCount: number;
}

export interface WeeklySchedule {
  startDate: string;
  endDate: string;
  days: TeamScheduleDay[];
}

// Analytics types (backend only for MVP)
export interface UserEngagement {
  user_id: string;
  office_days_count: number;
  remote_days_count: number;
  office_day_streak: number;
  last_office_day?: string;
  compliance_rate: number; // percentage of compliance with RTO policy
}

export interface TeamEngagement {
  team_id: string;
  average_compliance_rate: number;
  highest_streak: number;
  lowest_streak: number;
  most_common_office_day: string;
}

// Gamification types (backend only for MVP)
export interface UserRewards {
  user_id: string;
  points: number;
  streaks: number;
  badges: string[];
  level: number;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Form data types
export interface TeamFormData {
  name: string;
  description?: string;
  rto_policy: {
    required_days: number;
    core_hours?: {
      start: string;
      end: string;
    };
  };
}

export interface InviteFormData {
  emails: string[];
  message?: string;
}

export interface ScheduleFormData {
  date: string;
  work_type: 'office' | 'remote' | 'flexible';
  notes?: string;
}