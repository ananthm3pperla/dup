import { CompanySettings, EventType, Requirement, WorkStatus } from '../types';

const customStatuses: WorkStatus[] = [
  {
    id: 'office',
    name: 'In Office',
    color: 'blue',
    icon: 'building',
    countAsPresent: true,
  },
  {
    id: 'remote',
    name: 'Remote',
    color: 'green',
    icon: 'home',
    countAsPresent: true,
  },
  {
    id: 'traveling',
    name: 'Business Travel',
    color: 'purple',
    icon: 'plane',
    countAsPresent: true,
  },
  {
    id: 'flexible',
    name: 'Flexible Hours',
    color: 'orange',
    icon: 'clock',
    countAsPresent: true,
  },
];

const eventTypes: EventType[] = [
  {
    id: 'team-meeting',
    name: 'Team Meeting',
    color: 'blue',
    icon: 'users',
    requiresAttendance: true,
    defaultDuration: 60,
    applicableDepartments: ['All'],
  },
  {
    id: 'one-on-one',
    name: '1:1 Meeting',
    color: 'green',
    icon: 'user',
    requiresAttendance: true,
    defaultDuration: 30,
    applicableDepartments: ['All'],
  },
  {
    id: 'workshop',
    name: 'Workshop',
    color: 'purple',
    icon: 'presentation',
    requiresAttendance: true,
    defaultDuration: 120,
    applicableDepartments: ['All'],
  },
  {
    id: 'training',
    name: 'Training Session',
    color: 'orange',
    icon: 'graduation-cap',
    requiresAttendance: true,
    defaultDuration: 90,
    applicableDepartments: ['All'],
  },
];

const requirements: Requirement[] = [
  {
    id: 'office-days',
    name: 'Office Days',
    type: 'attendance',
    target: 2,
    unit: 'days',
    frequency: 'weekly',
    description: 'Required in-office days per week',
  },
  {
    id: 'team-meetings',
    name: 'Team Meetings',
    type: 'attendance',
    target: 90,
    unit: 'percentage',
    frequency: 'monthly',
    description: 'Team meeting attendance rate',
  },
  {
    id: 'collaboration-hours',
    name: 'Collaboration Hours',
    type: 'engagement',
    target: 12,
    unit: 'hours',
    frequency: 'weekly',
    description: 'Time spent in collaborative activities',
  },
];

export const companySettings: CompanySettings = {
  name: 'Capital One',
  founded: 1988,
  location: 'McLean, Virginia',
  branding: {
    primaryColor: '#004977',
    secondaryColor: '#A12B2B',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Capital_One_logo.svg/2560px-Capital_One_logo.svg.png',
    hiBridgeLogo: {
      type: 'icon',
    }
  },
  workPolicy: {
    customStatuses,
    eventTypes,
    requirements,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    coreHours: {
      start: '10:00',
      end: '16:00',
    },
  },
  departments: [
    {
      id: 'technology',
      name: 'Technology',
      headCount: 150,
      inOfficePercentage: 40,
      requiredDays: 2,
      eventTypes: ['team-meeting', 'one-on-one', 'workshop', 'training'],
      customRequirements: requirements,
    },
    {
      id: 'product',
      name: 'Product Management',
      headCount: 75,
      inOfficePercentage: 50,
      requiredDays: 3,
      eventTypes: ['team-meeting', 'one-on-one', 'workshop', 'training'],
      customRequirements: requirements,
    },
    {
      id: 'risk',
      name: 'Risk Management',
      headCount: 100,
      inOfficePercentage: 45,
      requiredDays: 2,
      eventTypes: ['team-meeting', 'one-on-one', 'workshop', 'training'],
      customRequirements: requirements,
    },
  ],
  terminology: {
    employee: 'Associate',
    office: 'Campus',
    meeting: 'Meeting',
    attendance: 'Attendance',
    remote: 'Remote',
  },
};