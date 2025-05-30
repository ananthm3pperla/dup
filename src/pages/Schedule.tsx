import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { format, startOfWeek, addDays } from 'date-fns';
import { 
  Calendar, Users, Building2, Home, Info, CheckCircle, UserCheck, 
  Clock
} from 'lucide-react';
import { Card, Button, PageHeader } from '@/components/ui';
import { WeeklyCalendar } from '@/components/calendar';
import { toast } from 'sonner';
import FeedbackButton from '@/components/FeedbackButton';
import { isDemoMode, DEMO_STATIC_SCHEDULES } from '@/lib/demo';
import { MeetingsDisplay, MOCK_CALENDAR_EVENTS, VotingCalendar } from '@/components/calendar';

// Static team member schedules for the demo
const STATIC_TEAM_SCHEDULES = [
  {
    member: 1,
    name: "Sarah Chen",
    role: "Senior Software Engineer",
    schedule: ['remote', 'office', 'remote', 'office', 'remote']
  },
  {
    member: 2,
    name: "Raj Patel",
    role: "Product Manager",
    schedule: ['office', 'office', 'remote', 'office', 'remote']
  },
  {
    member: 3,
    name: "Emily Johnson",
    role: "UX Designer",
    schedule: ['remote', 'office', 'office', 'office', 'remote']
  },
  {
    member: 4,
    name: "Michael Zhang",
    role: "Engineering Manager",
    schedule: ['office', 'office', 'remote', 'office', 'office']
  },
  {
    member: 5,
    name: "Alex Rodriguez",
    role: "Data Scientist",
    schedule: ['remote', 'office', 'office', 'office', 'remote']
  }
];

export default function Schedule() {
  const { user } = useAuth();
  const { currentTeam, isTeamLeader } = useTeam();
  const { currentWeek, userSchedule, loadUserSchedule, loadTeamSchedule } = useSchedule();
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'next' | 'team'>('current');
  const [meetings, setMeetings] = useState(MOCK_CALENDAR_EVENTS);

  // Load schedules on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadUserSchedule(),
          loadTeamSchedule()
        ]);
      } catch (err) {
        console.error('Error loading schedules:', err);
        toast.error('Failed to load schedule data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [loadUserSchedule, loadTeamSchedule]);

  // Handle feedback submission
  const handleFeedbackSubmit = async (score: number, feedback: string) => {
    try {
      // In production, you would send this to your backend
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Thank you for your feedback!');
      return Promise.resolve();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error('Failed to submit feedback');
      return Promise.reject(err);
    }
  };

  // Define anchor days for demo mode
  const getDemoAnchorDays = () => {
    if (isDemoMode() && DEMO_STATIC_SCHEDULES) {
      return DEMO_STATIC_SCHEDULES.anchor_days || [];
    }
    return [];
  };

  const anchorDays = getDemoAnchorDays();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Schedule" 
        description="Manage your in-office and remote work schedule"
        action={
          <div className="flex items-center gap-2">
            {isTeamLeader && (
              <Button 
                variant="outline"
                onClick={() => setActiveTab('team')}
                className="hidden sm:flex"
              >
                <Users className="h-4 w-4 mr-2" />
                Team View
              </Button>
            )}
            <FeedbackButton 
              buttonText="Schedule Feedback" 
              onSubmit={handleFeedbackSubmit}
            />
          </div>
        }
      />

      {currentTeam?.rto_policy && (
        <div className="mx-0 my-4 p-3 rounded-md bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
            <Info className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">
              <strong>Team Policy:</strong> {currentTeam.rto_policy.required_days} days in the office per week
              {currentTeam.rto_policy.core_hours && (
                <span> with core hours from {currentTeam.rto_policy.core_hours.start} to {currentTeam.rto_policy.core_hours.end}</span>
              )}
            </p>
          </div>
        </div>
      )}

      <Card className="p-4 sm:p-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('current')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'current'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Calendar className="inline-block h-4 w-4 mr-2" />
              Current Week
            </button>
            <button
              onClick={() => setActiveTab('next')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'next'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Calendar className="inline-block h-4 w-4 mr-2" />
              Next Week
            </button>
            {isTeamLeader && (
              <button
                onClick={() => setActiveTab('team')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'team'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Users className="inline-block h-4 w-4 mr-2" />
                Team View
              </button>
            )}
          </nav>
        </div>

        {/* Current Week Schedule (Read-only with Anchor Days) */}
        {activeTab === 'current' && (
          <div>
            <div className="mb-4 flex items-center">
              <div className="bg-primary text-white px-2 py-1 rounded text-xs font-bold mr-2 uppercase">
                Anchor Days
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Days when most team members are in the office</span>
            </div>
            <WeeklyCalendar 
              viewMode="current"
              anchorDays={anchorDays}
              hideNavigation={true}
            />
            
            {/* Calendar Integration */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <MeetingsDisplay meetings={meetings} />
            </div>
          </div>
        )}

        {/* Next Week Schedule (Editable) */}
        {activeTab === 'next' && (
          <div>
              <VotingCalendar />
          </div>
        )}
        
        {/* Team Schedule View */}
        {activeTab === 'team' && isTeamLeader && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Team Schedule Overview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              View your team's schedule and coordinate in-office days for better collaboration.
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Team Member
                    </th>
                    {Array.from({ length: 5 }, (_, i) => {
                      const day = addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), i);
                      const isAnchorDay = i === 1 || i === 3; // Tuesday and Thursday
                      return (
                        <th key={i} scope="col" className={`py-3 px-4 text-center text-xs font-medium uppercase tracking-wider ${
                          isAnchorDay 
                            ? 'bg-primary/20 text-primary-dark dark:bg-primary/30 dark:text-primary-light' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {isAnchorDay && <div className="text-[10px] font-bold mb-1">ANCHOR DAY</div>}
                          {format(day, 'EEE, MMM d')}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {STATIC_TEAM_SCHEDULES.map(member => (
                    <tr key={member.member} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{member.role}</div>
                          </div>
                        </div>
                      </td>
                      {Array.from({ length: 5 }, (_, i) => {
                        // Get work type for this day
                        const workType = member.schedule[i];
                        
                        // Mark anchor days (Tuesday and Thursday for demo)
                        const isAnchorDay = i === 1 || i === 3;

                        return (
                          <td key={i} className={`py-4 px-4 whitespace-nowrap text-center ${
                            isAnchorDay ? 'bg-primary/5 dark:bg-primary/10' : ''
                          }`}>
                            <div className="flex flex-col items-center">
                              {workType ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${workType === 'office' ? 'bg-primary/10 text-primary' : 
                                    'bg-success/10 text-success'}
                                `}>
                                  {workType === 'office' ? (
                                    <Building2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Home className="h-3 w-3 mr-1" />
                                  )}
                                  {workType.charAt(0).toUpperCase() + workType.slice(1)}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  leftIcon={<UserCheck className="h-4 w-4" />}
                >
                  Send Reminder
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      {/* Additional Schedule Information */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Schedule at a Glance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-primary/30 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                <Building2 className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Office Requirements
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentTeam?.rto_policy.required_days || 3} days per week in office
                </p>
              </div>
            </div>
            {currentTeam?.rto_policy.core_hours && (
              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                Core hours: {currentTeam.rto_policy.core_hours.start} - {currentTeam.rto_policy.core_hours.end}
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-success-50 dark:bg-success-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-success-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Current Week Compliance
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your schedule compliance status
                </p>
              </div>
            </div>
            {userSchedule.filter(s => s.work_type === 'office').length >= (currentTeam?.rto_policy.required_days || 3) ? (
              <div className="text-sm text-success flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Meeting office day requirements
              </div>
            ) : (
              <div className="text-sm text-warning flex items-center gap-2">
                <Info className="h-4 w-4" />
                Need {(currentTeam?.rto_policy.required_days || 3) - userSchedule.filter(s => s.work_type === 'office').length} more office days
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-primary/20 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Anchor Days
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Team coordination days
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-primary/20 text-primary px-3 py-1.5 rounded-md text-sm font-medium">
                Tuesday
              </div>
              <div className="bg-primary/20 text-primary px-3 py-1.5 rounded-md text-sm font-medium">
                Thursday
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}