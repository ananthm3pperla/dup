import React from 'react';
import { Building2, Users, MapPin, Calendar } from 'lucide-react';
import { Employee } from '../../../types';

interface OverviewProps {
  profile: Employee;
}

export default function Overview({ profile }: OverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-default mb-6">
            Work Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted mb-4">Core Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-default">Department</p>
                    <p className="text-sm text-muted">{profile.member_department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-default">Work Location</p>
                    <p className="text-sm text-muted capitalize">{profile.member_workLocation} Worker</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-default">Role</p>
                    <p className="text-sm text-muted">{profile.member_role}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted mb-4">Attendance Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-default">Total Days</p>
                    <p className="text-sm text-muted">{profile.member_attendance.total} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-default">Current Streak</p>
                    <p className="text-sm text-muted">{profile.member_attendance.streak} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-md">
          <h3 className="text-sm font-medium text-muted mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted">Email</p>
              <p className="text-sm font-medium text-default">{profile.member_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Phone</p>
              <p className="text-sm font-medium text-default">{profile.member_phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Location</p>
              <p className="text-sm font-medium text-default">{profile.member_location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}