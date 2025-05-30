import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { SimpleCard, LoadingState, PageHeader } from '@/components/ui';
import { isDemoMode } from '@/lib/demo';
import { Plus } from 'lucide-react';
import { AccountVerificationPrompt } from '@/components/auth';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DailyPulse from '@/components/dashboard/DailyPulse';
import TodaySchedule from '@/components/dashboard/TodaySchedule';
import TeamSchedule from '@/components/dashboard/TeamSchedule';
import CheckInCard from '@/components/dashboard/CheckInCard';
import RecentAchievements from '@/components/dashboard/RecentAchievements';
import TeamPulseMonitoring from '@/components/dashboard/TeamPulseMonitoring';
import KeyMetrics from '@/components/dashboard/KeyMetrics';

export default function Dashboard() {
  const { user } = useAuth();
  const { isTeamLeader } = useTeam();
  const [isLoading, setIsLoading] = React.useState(true);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  // Get user's first name from the profile
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  // Check if email is verified
  useEffect(() => {
    if (user && !user.email_confirmed_at && !isDemoMode()) {
      setShowVerificationPrompt(true);
    }
  }, [user]);

  // Simulate loading to ensure all components are ready
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // If in demo mode, trigger walkthrough if not seen
      if (isDemoMode() && !localStorage.getItem('hasSeenWalkthrough')) {
        localStorage.removeItem('hasSeenWalkthrough');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <DashboardHeader firstName={firstName} />
      
      {/* Email verification prompt */}
      {showVerificationPrompt && (
        <AccountVerificationPrompt 
          onVerify={() => setShowVerificationPrompt(false)}
          onSkip={() => setShowVerificationPrompt(false)}
        />
      )}
      
      <div className="grid grid-cols-1 gap-4 sm:gap-8 pb-4 sm:pb-8">
        {/* First row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 dark:border dark:border-gray-700">
            <TodaySchedule />
          </div>
          <div className="lg:col-span-1">
            <DailyPulse />
          </div>
        </div>
        
        {/* Second row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 dark:border dark:border-gray-700">
            <TeamSchedule />
          </div>
          <div className="lg:col-span-1 space-y-4 sm:space-y-8">
            <CheckInCard />
            <RecentAchievements />
          </div>
        </div>

        {/* Team Pulse Monitoring for leaders */}
        {isTeamLeader && (
          <div className="grid grid-cols-1 gap-4 sm:gap-8">
            <KeyMetrics />
            <TeamPulseMonitoring />
          </div>
        )}
      </div>
    </div>
  );
}