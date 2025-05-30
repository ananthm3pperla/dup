import React from 'react';
import { Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';
import { Employee } from '../../../types';

interface ActivityProps {
  profile: Employee;
}

export default function Activity({ profile }: ActivityProps) {
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
              Last visit: {format(new Date(profile.member_attendance.lastVisit), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-default">Current Streak</p>
            <p className="text-xs text-muted">{profile.member_attendance.streak} days</p>
          </div>
        </div>
      </div>
    </div>
  );
}