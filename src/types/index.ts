export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  emailVerified?: boolean;
}

export type TabType = 'overview' | 'experience' | 'education' | 'team' | 'activity';

export interface TabComponentProps {
  profile: Employee;
  canEdit?: boolean;
  isSaving?: boolean;
  onAdd?: () => void;
  onSave?: (index: number, data: any) => void;
  onDelete?: (index: number) => void;
  onNodeClick?: (id: string) => void;
}

export interface Employee {
  id: string;
  member_id: string;
  member_name: string;
  member_email: string;
  member_role: string;
  member_department: string;
  member_avatar: string;
  member_location: string;
  member_phone: string;
  member_workLocation: string;
  member_attendance: {
    total: number;
    streak: number;
    lastVisit: string;
    bio?: string;
  };
  member_education?: Education[];
  member_work_history?: WorkHistory[];
}

export interface Education {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  honors?: string[];
}

export interface WorkHistory {
  id?: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  category: string;
  availability: 'limited' | 'unlimited';
  expiresAt?: string;
  remainingCount?: number;
}

export interface OrgChart {
  id: string;
  name: string;
  role: string;
  avatar: string;
  children: OrgChart[];
}

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
  team_id?: string;
  user_id?: string;
  role?: string;
  joined_at?: string;
  user?: any;
  member_id?: string;
  member_name?: string;
  member_email?: string;
  member_role?: string;
  member_department?: string;
  member_avatar?: string;
  member_location?: string;
  member_phone?: string;
  member_workLocation?: string;
  member_attendance?: {
    total: number;
    streak: number;
    lastVisit: string;
    bio?: string;
  };
}

export interface WorkSchedule {
  id: string;
  user_id: string;
  date: string;
  work_type: 'office' | 'remote' | 'flexible';
  notes?: string | null;
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

export interface OneOnOneMeeting {
  id: string;
  manager_id?: string;
  employee_id?: string;
  managerId?: string;
  employeeId?: string;
  scheduled_at?: string;
  scheduledAt?: string;
  duration?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Company settings types
export interface CompanySettings {
  name: string;
  founded: number;
  location: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    hiBridgeLogo: {
      type: string;
    }
  };
  workPolicy: {
    customStatuses: WorkStatus[];
    eventTypes: EventType[];
    requirements: Requirement[];
    workingDays: string[];
    coreHours: {
      start: string;
      end: string;
    };
  };
  departments: Department[];
  terminology: {
    employee: string;
    office: string;
    meeting: string;
    attendance: string;
    remote: string;
  };
}

export interface WorkStatus {
  id: string;
  name: string;
  color: string;
  icon: string;
  countAsPresent: boolean;
}

export interface EventType {
  id: string;
  name: string;
  color: string;
  icon: string;
  requiresAttendance: boolean;
  defaultDuration: number;
  applicableDepartments: string[];
}

export interface Requirement {
  id: string;
  name: string;
  type: string;
  target: number;
  unit: string;
  frequency: string;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  headCount: number;
  inOfficePercentage: number;
  requiredDays: number;
  eventTypes: string[];
  customRequirements: Requirement[];
}