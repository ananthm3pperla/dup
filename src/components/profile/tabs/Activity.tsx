import React from 'react';
import { Calendar, Award, Building2, Home } from 'lucide-react';
import { format } from 'date-fns';
import { Employee } from '@/types';

interface ActivityProps {
  profile: Employee;
}

export default function Activity({ profile }: ActivityProps) {
  // If there's no attendance data, create default values
  const attendance = profile.member_attendance || {
    total: 0,
    streak: 0,
    lastVisit: new Date().toISOString()
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold text-default mb-6">Recent Activity</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-default">Office Attendance</p>
            <p className="text-xs text-muted">
              Last visit: {format(new Date(attendance.lastVisit), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-default">Current Streak</p>
            <p className="text-xs text-muted">{attendance.streak} days</p>
          </div>
        </div>
        
        {/* Add work preference section */}
        <div className="mt-6 pt-6 border-t border-default">
          <h3 className="text-sm font-medium text-default mb-4">Work Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted">Preferred Office Days</p>
                <p className="text-sm font-medium text-default">2-3 days per week</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Home className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted">Preferred Work Location</p>
                <p className="text-sm font-medium text-default">{profile.member_workLocation || 'Hybrid'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}