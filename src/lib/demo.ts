import { User } from '@supabase/supabase-js';

// Demo user data
export const DEMO_USER = {
  id: '3dfadd8d-cf2d-40da-a716-446655440000',
  email: 'mepperlaananth1@gmail.com',
  full_name: 'Ananth Mepperla',
  avatar_url: 'https://media.licdn.com/dms/image/v2/C5603AQGigcyM8qS6Jg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1632690243912?e=1750896000&v=beta&t=FS4wwjQr7sCfRo0IDsuCGxfXd3I6RWSmNhuDSvN-A2w',
  emailVerified: true
};

// Demo team members
export const DEMO_TEAM_MEMBERS = [
  {
    id: '1',
    member_id: DEMO_USER.id,
    member_name: DEMO_USER.full_name,
    member_email: DEMO_USER.email,
    member_role: 'Founder/CEO',
    member_department: 'C-Suite',
    member_avatar: DEMO_USER.avatar_url,
    member_location: 'Dallas, TX',
    member_phone: '(916)-547-7734',
    member_workLocation: 'Hybrid',
    member_attendance: {
      total: 150,
      streak: 15,
      lastVisit: new Date().toISOString(),
      bio: 'Engineering leader with a passion for building scalable systems and mentoring teams. Focused on cloud-native architectures and DevOps practices.'
    },
    member_education: [
      {
        school: 'Arizona State University',
        degree: 'Information Security',
        field: 'Business',
        startYear: 2017,
        endYear: 2021,
        honors: []
      }
    ],
    member_work_history: [
      {
        company: 'Capital One',
        role: 'Associate Software Engineer',
        location: 'Dallas, TX',
        startDate: '2022-02',
        endDate: undefined,
        highlights: [
          'Implemented custom + marketplace plugins and components within Backstage to enhance functionality and tailor the portal to meet internal development needs, improving developer productivity and workflow efficiency.',
          'Utilized Agile methodologies to deliver iterative improvements, integrating user feedback(research studies+listening tours) and requirements into backend features and UI enhancements.',
          'Supported product strategy discussions by offering technical perspectives, proof of concepts and feasibility assessments on proposed features and enhancements, aiding in informed decision-making and strategic planning.'
        ]
      }
    ]
  },
  {
    id: '2',
    member_id: 'demo-member-2',
    member_name: 'Sarah Chen',
    member_email: 'sarah.chen@example.com',
    member_role: 'Senior Software Engineer',
    member_department: 'Engineering',
    member_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    member_location: 'San Francisco, CA',
    member_phone: '(415) 555-0123',
    member_workLocation: 'Hybrid',
    member_attendance: {
      total: 132,
      streak: 7,
      lastVisit: new Date().toISOString()
    },
    member_education: [
      {
        school: 'Stanford University',
        degree: 'Computer Science',
        field: 'Machine Learning',
        startYear: 2010,
        endYear: 2014,
        honors: ['Summa Cum Laude', 'Dean\'s List']
      }
    ],
    member_work_history: [
      {
        company: 'Google',
        role: 'Software Engineer',
        location: 'Mountain View, CA',
        startDate: '2014-06',
        endDate: '2020-05',
        highlights: [
          'Led development of machine learning algorithms for search quality',
          'Improved query performance by 35% through optimizations',
          'Mentored junior engineers and interns'
        ]
      }
    ]
  },
  {
    id: '3',
    member_id: 'demo-member-3',
    member_name: 'Raj Patel',
    member_email: 'raj.patel@example.com',
    member_role: 'Product Manager',
    member_department: 'Product',
    member_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    member_location: 'New York, NY',
    member_phone: '(212) 555-0456',
    member_workLocation: 'Office',
    member_attendance: {
      total: 168,
      streak: 12,
      lastVisit: new Date().toISOString()
    },
    member_education: [
      {
        school: 'Harvard Business School',
        degree: 'MBA',
        field: 'Product Management',
        startYear: 2013,
        endYear: 2015,
        honors: ['Baker Scholar']
      }
    ],
    member_work_history: [
      {
        company: 'Amazon',
        role: 'Senior Product Manager',
        location: 'Seattle, WA',
        startDate: '2015-08',
        endDate: '2021-03',
        highlights: [
          'Launched 3 major product initiatives generating $50M+ in new revenue',
          'Led cross-functional teams of 15+ people',
          'Developed product strategy for enterprise offerings'
        ]
      }
    ]
  },
  {
    id: '4',
    member_id: 'demo-member-4',
    member_name: 'Emily Johnson',
    member_email: 'emily.johnson@example.com',
    member_role: 'UX Designer',
    member_department: 'Design',
    member_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    member_location: 'Austin, TX',
    member_phone: '(512) 555-0789',
    member_workLocation: 'Remote',
    member_attendance: {
      total: 98,
      streak: 0,
      lastVisit: new Date().toISOString()
    },
    member_education: [
      {
        school: 'Rhode Island School of Design',
        degree: 'BFA',
        field: 'Graphic Design',
        startYear: 2012,
        endYear: 2016,
        honors: []
      }
    ],
    member_work_history: [
      {
        company: 'Airbnb',
        role: 'Senior UX Designer',
        location: 'Austin, TX',
        startDate: '2016-09',
        endDate: '2022-01',
        highlights: [
          'Redesigned key conversion flows, increasing conversion by 23%',
          'Established design system used across product suite',
          'Conducted user research and usability testing'
        ]
      }
    ]
  },
  {
    id: '5',
    member_id: 'demo-member-5',
    member_name: 'Michael Zhang',
    member_email: 'michael.zhang@example.com',
    member_role: 'Engineering Manager',
    member_department: 'Engineering',
    member_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    member_location: 'Seattle, WA',
    member_phone: '(206) 555-0123',
    member_workLocation: 'Hybrid',
    member_attendance: {
      total: 142,
      streak: 5,
      lastVisit: new Date().toISOString()
    },
    member_education: [
      {
        school: 'MIT',
        degree: 'MS',
        field: 'Computer Science',
        startYear: 2008,
        endYear: 2010,
        honors: []
      }
    ],
    member_work_history: [
      {
        company: 'Microsoft',
        role: 'Engineering Manager',
        location: 'Redmond, WA',
        startDate: '2010-06',
        endDate: '2021-11',
        highlights: [
          'Led team of 12 engineers working on Azure services',
          'Implemented agile methodologies resulting in 40% faster delivery',
          'Reduced production incidents by 65% through quality initiatives'
        ]
      }
    ]
  }
];

// Demo team data
export const DEMO_TEAM = {
  id: '8b6349f9-fdbf-406d-b414-13204e2f64e9',
  name: 'Engineering Team',
  description: 'Core platform engineering team responsible for Hi-Bridge development',
  created_by: DEMO_USER.id,
  invite_code: 'HIBRIDGE1',
  rto_policy: {
    required_days: 3,
    core_hours: {
      start: '10:00',
      end: '16:00'
    },
    allowed_work_types: ['office', 'remote']
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Feature walkthrough steps
export const DEMO_WALKTHROUGH = [
  {
    id: 'dashboard',
    title: 'Welcome to Hi-Bridge',
    description: 'Your central hub for managing hybrid work. Start by exploring the dashboard.',
    element: '.dashboard-header',
    placement: 'bottom'
  },
  {
    id: 'office-days',
    title: 'Office Day Tracking',
    description: 'Track your office attendance and see your progress toward weekly goals.',
    element: '.office-days-card',
    placement: 'bottom'
  },
  {
    id: 'remote-days',
    title: 'Remote Day Balance',
    description: 'Earn remote days by coming to the office. Use them when you need flexibility.',
    element: '.remote-days-card',
    placement: 'bottom'
  },
  {
    id: 'daily-pulse',
    title: 'Daily Pulse Check-in',
    description: 'Share how you\'re feeling today to help your team understand your work experience.',
    element: '.daily-pulse',
    placement: 'left'
  },
  {
    id: 'check-in',
    title: 'Office Check-ins',
    description: 'Verify your office presence with photo check-ins when you arrive.',
    element: '.check-in-card',
    placement: 'right'
  }
];

// Demo static schedule data
export const DEMO_STATIC_SCHEDULES = {
  current_week: [
    { date: "2025-03-18", work_type: "office" }, // Monday
    { date: "2025-03-19", work_type: "office" }, // Tuesday - Anchor
    { date: "2025-03-20", work_type: "remote" }, // Wednesday
    { date: "2025-03-21", work_type: "office" }, // Thursday - Anchor
    { date: "2025-03-22", work_type: "remote" }  // Friday
  ],
  next_week: [
    { date: "2025-03-25", work_type: "office" },  // Monday
    { date: "2025-03-26", work_type: "office" },  // Tuesday - Anchor
    { date: "2025-03-27", work_type: "office" },  // Wednesday
    { date: "2025-03-28", work_type: "office" },  // Thursday - Anchor
    { date: "2025-03-29", work_type: "remote" }   // Friday
  ],
  team_summary: {
    Monday: { office: 6, remote: 4 },
    Tuesday: { office: 8, remote: 2 },
    Wednesday: { office: 5, remote: 5 },
    Thursday: { office: 7, remote: 3 },
    Friday: { office: 3, remote: 7 }
  },
  // Define anchor days for demo mode - these are hardcoded in the WeeklyCalendar component now
  // to ensure consistent display in the UI with the design refresh
  anchor_days: []
};

// Check if demo mode is active
export function isDemoMode(): boolean {
  return window.sessionStorage.getItem('isDemoMode') === 'true';
}

// Initialize demo mode - with token bypass
export function initializeDemoMode() {
  // Set demo mode flag in session storage
  window.sessionStorage.setItem('isDemoMode', 'true');
  
  // Store demo user data for use across the application
  window.sessionStorage.setItem('demoUser', JSON.stringify(DEMO_USER));
  
  // Store team data
  window.sessionStorage.setItem('demoTeam', JSON.stringify(DEMO_TEAM));
  
  // Store team members data
  window.sessionStorage.setItem('demoTeamMembers', JSON.stringify(DEMO_TEAM_MEMBERS));
  
  // Store demo schedule data
  window.sessionStorage.setItem('demoStaticSchedules', JSON.stringify(DEMO_STATIC_SCHEDULES));
  
  // Cleanup any stale auth data that might interfere with demo mode
  sessionStorage.removeItem('sb-fpzycszcvxxbnmsrsvoa-auth-token');
  localStorage.removeItem('sb-fpzycszcvxxbnmsrsvoa-auth-token');
  sessionStorage.removeItem('hi-bridge-auth');
  localStorage.removeItem('hi-bridge-auth');
  
  // Clear any existing voting data to ensure a fresh start
  localStorage.removeItem('votedOfficeDays');
  localStorage.removeItem('scheduleVoteSubmitted');
  
  // Initialize other demo features
  initializeTeamPulseData();
  initializeRewardsData();
}

// Initialize team pulse data for demo
function initializeTeamPulseData() {
  // Create pulse data for the demo user
  const userPulse = {
    mood: 'good',
    timestamp: new Date().toISOString(),
    notes: 'Feeling productive today'
  };
  
  // Store in session storage
  window.sessionStorage.setItem('demoPulseData', JSON.stringify({
    pulses: {
      [formatDate(new Date())]: userPulse
    },
    notificationPreferences: {
      consecutiveChallenging: 3,
      challengingPerWeek: 3,
      enabled: true,
      notifyTeamLeader: true
    }
  }));
}

// Initialize rewards data for demo
function initializeRewardsData() {
  // Create rewards balance for demo user
  const rewardBalance = {
    current: 5.5,
    total_earned: 12,
    total_used: 6.5,
    streak: 3,
    last_office_day: new Date().toISOString(),
    accrual_model: 'ratio_based' as const,
    office_to_remote_ratio: 3,
    streak_bonus_threshold: 5,
    streak_bonus_amount: 1
  };
  
  // Create sample remote day requests
  const now = new Date();
  const remoteDayRequests = [
    {
      id: 'req-1',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(),
      days_requested: 1,
      status: 'approved' as const,
      reason: 'Doctor appointment',
      created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10).toISOString(),
      requires_high_limit_approval: false
    },
    {
      id: 'req-2',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 22).toISOString(),
      days_requested: 1,
      status: 'pending' as const,
      created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3).toISOString(),
      requires_high_limit_approval: false
    },
    {
      id: 'req-3',
      date: new Date(now.getFullYear(), now.getMonth() + 1, 29).toISOString(),
      days_requested: 2,
      status: 'pending' as const,
      reason: 'Family event',
      created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString(),
      requires_high_limit_approval: true
    }
  ];
  
  // Store in session storage
  window.sessionStorage.setItem('demoRewardBalance', JSON.stringify(rewardBalance));
  window.sessionStorage.setItem('demoRemoteRequests', JSON.stringify(remoteDayRequests));
}

// Persistent mock data storage
let mockDataCache: Record<string, any> = {};

/**
 * Gets consistent mock data in demo mode
 * @param key Unique key for the data
 * @param generator Function to generate the data if not already cached
 * @returns Consistent mock data
 */
export function getConsistentMockData<T>(key: string, generator: () => T): T {
  if (isDemoMode()) {
    if (!mockDataCache[key]) {
      // First check sessionStorage
      try {
        const storedData = sessionStorage.getItem(`demo_data_${key}`);
        if (storedData) {
          mockDataCache[key] = JSON.parse(storedData);
        } else {
          // Generate new data and store it
          mockDataCache[key] = generator();
          sessionStorage.setItem(`demo_data_${key}`, JSON.stringify(mockDataCache[key]));
        }
      } catch (error) {
        console.error('Failed to work with mock data in sessionStorage:', error);
        mockDataCache[key] = generator();
      }
    }
    return mockDataCache[key] as T;
  }
  
  // In non-demo mode, just generate fresh data
  return generator();
}

/**
 * Updates mock data in demo mode
 * @param key Unique key for the data
 * @param data New data or update function
 */
export function updateMockData<T>(key: string, data: T | ((prev: T) => T)): void {
  if (isDemoMode()) {
    if (typeof data === 'function') {
      const updateFn = data as (prev: T) => T;
      mockDataCache[key] = updateFn(mockDataCache[key] as T);
    } else {
      mockDataCache[key] = data;
    }
    
    // Update sessionStorage
    try {
      sessionStorage.setItem(`demo_data_${key}`, JSON.stringify(mockDataCache[key]));
    } catch (error) {
      console.error('Failed to update mock data in sessionStorage:', error);
    }
  }
}

/**
 * Loads cached mock data from sessionStorage on init
 */
export function loadCachedMockData(): void {
  if (isDemoMode()) {
    try {
      // Find all demo data keys in sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('demo_data_')) {
          const dataKey = key.replace('demo_data_', '');
          const data = JSON.parse(sessionStorage.getItem(key) || 'null');
          if (data !== null) {
            mockDataCache[dataKey] = data;
          }
        }
      });
    } catch (error) {
      console.error('Failed to load cached mock data:', error);
    }
  }
}

// Clean up demo mode data
export function cleanupDemoMode() {
  // Remove session storage key
  window.sessionStorage.removeItem('isDemoMode');
  
  // Remove all demo-related data
  window.sessionStorage.removeItem('demoUser');
  window.sessionStorage.removeItem('demoTeam');
  window.sessionStorage.removeItem('demoTeamMembers');
  window.sessionStorage.removeItem('demoStaticSchedules');
  window.sessionStorage.removeItem('demoPulseData');
  window.sessionStorage.removeItem('demoRewardBalance');
  window.sessionStorage.removeItem('demoRemoteRequests');
  
  // Clear voting data
  localStorage.removeItem('votedOfficeDays');
  localStorage.removeItem('scheduleVoteSubmitted');
  
  // Clear auth data that might still be present
  sessionStorage.removeItem('sb-fpzycszcvxxbnmsrsvoa-auth-token');
  localStorage.removeItem('sb-fpzycszcvxxbnmsrsvoa-auth-token');
  sessionStorage.removeItem('hi-bridge-auth');
  localStorage.removeItem('hi-bridge-auth');
  
  // Also clear any demo data items
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('demo_data_')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Clear mock data cache
  mockDataCache = {};
}

// Helper function for formatting dates
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Initialize mock data cache when this module is imported
loadCachedMockData();