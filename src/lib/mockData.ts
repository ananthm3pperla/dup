import { faker } from '@faker-js/faker';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { Team, TeamMember, Employee, OrgChart, Reward } from '../types';
import { isDemoMode, DEMO_USER, getConsistentMockData, updateMockData } from './demo';

// Generate a mock user for demo mode
export function generateMockUser(): Employee {
  return {
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    full_name: DEMO_USER.full_name,
    avatar_url: DEMO_USER.avatar_url,
    emailVerified: true
  };
}

// Generate mock teams for a user
export function generateMockTeams(userId: string, count: number = 1): Team[] {
  // Only generate mock teams for the demo user
  if (!isDemoMode()) {
    return [];
  }

  const generateTeamsData = () => {
    return Array.from({ length: count }, (_, i) => ({
      id: faker.string.uuid(),
      name: i === 0 ? 'Engineering Team' : `${faker.company.name()} Team`,
      description: i === 0 ? 'Core platform engineering team responsible for Hi-Bridge development' : faker.company.catchPhrase(),
      created_by: i === 0 ? userId : faker.string.uuid(),
      invite_code: faker.string.alphanumeric(8).toUpperCase(),
      rto_policy: {
        required_days: i === 0 ? 3 : faker.number.int({ min: 0, max: 5 }),
        core_hours: {
          start: '10:00',
          end: '16:00'
        },
        allowed_work_types: ['office', 'remote', 'flexible']
      },
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString()
    }));
  };

  return getConsistentMockData(`teams_${userId}`, generateTeamsData);
}

// Generate mock team members
export function generateTeamMembers(count: number = 5): TeamMember[] {
  // Fixed team members for consistent demo experience
  const generateMembersData = () => {
    const fixedMembers = isDemoMode() ? [
      {
        id: faker.string.uuid(),
        member_id: '3dfadd8d-cf2d-40da-a62f-8049d8a38820',
        member_name: 'Ananth Mepperla',
        member_email: 'mepperlaananth@gmail.com',
        member_role: 'Founder/CEO',
        member_department: 'Technology',
        member_avatar: 'https://media.licdn.com/dms/image/v2/C5603AQGigcyM8qS6Jg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1632690243912?e=1750896000&v=beta&t=FS4wwjQr7sCfRo0IDsuCGxfXd3I6RWSmNhuDSvN-A2w',
        member_location: 'Dallas, TX',
        member_phone: '(916)-547-7734',
        member_workLocation: 'Hybrid',
        member_attendance: {
          total: 150,
          streak: 15,
          lastVisit: new Date().toISOString(),
          bio: 'Engineering leader with a passion for building scalable systems and mentoring teams. Focused on cloud-native architectures and DevOps practices.'
        },
        member_education: [],
        member_experience: []
      }
    ] : [];

    // Generate additional fixed members for demo mode to ensure consistency
    if (isDemoMode()) {
      const additionalFixedMembers = [
        {
          id: faker.string.uuid(),
          member_id: faker.string.uuid(),
          member_name: 'Sarah Chen',
          member_email: 'sarah.chen@example.com',
          member_role: 'Senior Software Engineer',
          member_department: 'Technology',
          member_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          member_location: 'San Francisco, CA',
          member_phone: '(415) 555-0123',
          member_workLocation: 'Hybrid',
          member_attendance: {
            total: 132,
            streak: 7,
            lastVisit: new Date().toISOString()
          }
        },
        {
          id: faker.string.uuid(),
          member_id: faker.string.uuid(),
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
          }
        },
        {
          id: faker.string.uuid(),
          member_id: faker.string.uuid(),
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
          }
        }
      ];
      
      fixedMembers.push(...additionalFixedMembers);
    }

    // Generate additional random members if needed (for non-demo mode)
    const additionalMembers = Array.from({ length: Math.max(0, count - fixedMembers.length) }, (_, i) => ({
      id: faker.string.uuid(),
      member_id: faker.string.uuid(),
      member_name: faker.person.fullName(),
      member_email: faker.internet.email(),
      member_role: `${faker.person.jobTitle()} ${i % 3 === 0 ? 'Lead' : i % 3 === 1 ? 'Senior' : ''}`,
      member_department: i % 3 === 0 ? 'Technology' : i % 3 === 1 ? 'Product Management' : 'Risk Management',
      member_avatar: faker.image.avatar(),
      member_location: `${faker.location.city()}, ${faker.location.state()}`,
      member_phone: faker.phone.number(),
      member_workLocation: i % 3 === 0 ? 'Remote' : i % 3 === 1 ? 'Hybrid' : 'Office',
      member_attendance: {
        total: 100 + i,
        streak: 5 + (i % 10),
        lastVisit: new Date().toISOString()
      }
    }));

    return [...fixedMembers, ...additionalMembers];
  };

  return getConsistentMockData('team_members', generateMembersData);
}

// Generate mock achievements
export function generateMockAchievements(count: number) {
  const generateAchievementsData = () => {
    return Array.from({ length: count }, (_, index) => ({
      id: faker.string.uuid(),
      title: [
        'Perfect Attendance Streak',
        'Team Collaboration Champion',
        'High Engagement Score',
        'Project Milestone Reached',
        'Mentorship Excellence'
      ][index % 5],
      description: [
        'Maintained consistent office presence',
        'Led successful cross-team initiative',
        'Achieved highest team engagement score',
        'Delivered key project ahead of schedule',
        'Successfully mentored junior team members'
      ][index % 5],
      date: faker.date.recent({ days: 30 }).toISOString(),
      points: [50, 100, 150, 200, 250][index % 5],
      type: ['attendance', 'collaboration', 'engagement'][index % 3]
    }));
  };

  return getConsistentMockData(`achievements_${count}`, generateAchievementsData);
}

// Get department summary
export function getDepartmentSummary(departmentName: string) {
  const generateSummaryData = () => {
    const headCount = 20 + (departmentName === 'Technology' ? 30 : departmentName === 'Product Management' ? 20 : 10);
    const inOfficePercentage = 40 + (departmentName === 'Technology' ? 10 : departmentName === 'Product Management' ? 15 : 5);
    
    const fixedMembers = [
      {
        member_id: DEMO_USER.id,
        member_name: DEMO_USER.full_name,
        member_role: 'Founder/CEO',
        member_email: DEMO_USER.email,
        member_department: 'Technology',
        member_avatar: DEMO_USER.avatar_url,
        member_location: 'Dallas, TX',
        member_phone: '(916)-547-7734',
        member_workLocation: 'Hybrid',
        member_attendance: {
          total: 150,
          streak: 15,
          lastVisit: new Date().toISOString()
        }
      }
    ];
    
    // Add additional consistent members
    const additionalMembers = [
      {
        member_id: faker.string.uuid(),
        member_name: 'Sarah Chen',
        member_role: 'Senior Software Engineer',
        member_email: 'sarah.chen@example.com',
        member_department: 'Technology',
        member_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        member_location: 'San Francisco, CA',
        member_phone: '(415) 555-0123',
        member_workLocation: 'Hybrid',
        member_attendance: {
          total: 132,
          streak: 7,
          lastVisit: new Date().toISOString()
        }
      },
      {
        member_id: faker.string.uuid(),
        member_name: 'Raj Patel',
        member_role: 'Product Manager',
        member_email: 'raj.patel@example.com',
        member_department: 'Product Management',
        member_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        member_location: 'New York, NY',
        member_phone: '(212) 555-0456',
        member_workLocation: 'Office',
        member_attendance: {
          total: 168,
          streak: 12,
          lastVisit: new Date().toISOString()
        }
      },
      {
        member_id: faker.string.uuid(),
        member_name: 'Emily Johnson',
        member_role: 'UX Designer',
        member_email: 'emily.johnson@example.com',
        member_department: 'Design',
        member_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        member_location: 'Austin, TX',
        member_phone: '(512) 555-0789',
        member_workLocation: 'Remote',
        member_attendance: {
          total: 98,
          streak: 0,
          lastVisit: new Date().toISOString()
        }
      }
    ].filter(m => m.member_department === departmentName);
    
    return {
      name: departmentName,
      headCount,
      inOfficeCount: Math.floor(headCount * (inOfficePercentage / 100)),
      remoteCount: headCount - Math.floor(headCount * (inOfficePercentage / 100)),
      department_members: [...fixedMembers, ...additionalMembers].filter(member => 
        member.member_department === departmentName || departmentName === 'All'
      )
    };
  };

  return getConsistentMockData(`department_summary_${departmentName}`, generateSummaryData);
}

// Get organization chart
export function getOrgChart(rootId: string): OrgChart | null {
  // Return fixed org chart for demo user
  if (isDemoMode() && rootId === DEMO_USER.id) {
    const generateOrgChartData = () => {
      return {
        id: rootId,
        name: DEMO_USER.full_name,
        role: 'Founder/CEO',
        avatar: DEMO_USER.avatar_url,
        children: [
          {
            id: 'tech-lead-id',
            name: 'Sarah Chen',
            role: 'Senior Software Engineer',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            children: []
          },
          {
            id: 'product-lead-id',
            name: 'Raj Patel',
            role: 'Product Manager',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            children: []
          },
          {
            id: 'design-lead-id',
            name: 'Emily Johnson',
            role: 'UX Designer',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            children: []
          }
        ]
      };
    };

    return getConsistentMockData(`org_chart_${rootId}`, generateOrgChartData);
  }

  // Generate random org chart for other users
  const generateNode = (depth: number = 0): any => {
    if (depth > 2) return null;

    const node = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      role: faker.person.jobTitle(),
      avatar: faker.image.avatar(),
      children: []
    };

    if (depth < 2) {
      const numChildren = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numChildren; i++) {
        const child = generateNode(depth + 1);
        if (child) {
          node.children.push(child);
        }
      }
    }

    return node;
  };

  return getConsistentMockData(`org_chart_${rootId}`, () => generateNode());
}

// Generate mock rewards for the marketplace
export function generateMockRewards(count: number = 10): Reward[] {
  const generateRewardsData = () => {
    // Fixed rewards for consistency
    const fixedRewards = [
      {
        id: 'reward-1',
        title: 'Extra Remote Day',
        description: 'Redeem for an additional day of remote work beyond your regular allocation.',
        imageUrl: 'https://images.unsplash.com/photo-1522881193457-37ae97c905bf?w=500&h=300&q=80',
        pointsCost: 200,
        category: 'Remote Work',
        availability: 'limited' as const,
        expiresAt: addDays(new Date(), 60).toISOString(),
        remainingCount: 15
      },
      {
        id: 'reward-2',
        title: 'Coffee with the CEO',
        description: 'Schedule a 30-minute one-on-one coffee chat with our CEO to share your ideas.',
        imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&h=300&q=80',
        pointsCost: 350,
        category: 'Experiences',
        availability: 'limited' as const,
        expiresAt: addDays(new Date(), 90).toISOString(),
        remainingCount: 5
      },
      {
        id: 'reward-3',
        title: 'Team Lunch',
        description: 'Treat your team to lunch on the company (up to $25 per person).',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=300&q=80',
        pointsCost: 300,
        category: 'Team Building',
        availability: 'unlimited' as const,
        expiresAt: addDays(new Date(), 180).toISOString()
      },
      {
        id: 'reward-4',
        title: 'Amazon Gift Card',
        description: '$50 Amazon gift card to spend on whatever you like.',
        imageUrl: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=500&h=300&q=80',
        pointsCost: 500,
        category: 'Gift Cards',
        availability: 'limited' as const,
        expiresAt: addDays(new Date(), 120).toISOString(),
        remainingCount: 20
      },
      {
        id: 'reward-5',
        title: 'Noise-Cancelling Headphones',
        description: 'Premium noise-cancelling headphones for your focus time.',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&h=300&q=80',
        pointsCost: 1000,
        category: 'Technology',
        availability: 'limited' as const,
        expiresAt: addDays(new Date(), 60).toISOString(),
        remainingCount: 3
      }
    ];

    // Add additional rewards to reach desired count
    const additionalRewards = Array.from({ length: Math.max(0, count - fixedRewards.length) }, (_, i) => ({
      id: `reward-${i + fixedRewards.length + 1}`,
      title: [
        'Professional Development Course',
        'Wellness Day',
        'Company Swag Pack',
        'Charitable Donation',
        'Premium Parking Spot',
        'Home Office Upgrade',
        'Fitness Membership',
        'Conference Ticket'
      ][i % 8],
      description: faker.lorem.sentences(2),
      imageUrl: `https://images.unsplash.com/photo-${1500 + i}?w=500&h=300&q=80`,
      pointsCost: [150, 250, 300, 400, 500, 600, 750, 800][i % 8],
      category: [
        'Learning',
        'Wellness',
        'Company',
        'Charity',
        'Office Perks',
        'Home Office',
        'Health',
        'Learning'
      ][i % 8],
      availability: i % 3 === 0 ? 'unlimited' as const : 'limited' as const,
      expiresAt: addDays(new Date(), 30 + i * 10).toISOString(),
      remainingCount: i % 3 === 0 ? undefined : 5 + i
    }));

    return [...fixedRewards, ...additionalRewards].slice(0, count);
  };

  return getConsistentMockData(`rewards_${count}`, generateRewardsData);
}