import React from 'react';
import { format } from 'date-fns';
import { Check, X, Camera, MapPin } from 'lucide-react';
import { Card } from '@/components/ui';

interface CheckIn {
  id: string;
  checkin_time: string;
  photo_url: string;
  location_verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  verified_by?: {
    name: string;
    avatar_url: string;
  };
  verified_at?: string;
}

interface CheckInHistoryProps {
  checkins: CheckIn[];
}

export default function CheckInHistory({ checkins }: CheckInHistoryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">My Check-in History</h3>
      {checkins.map(checkin => (
        <Card key={checkin.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={checkin.photo_url}
                  alt={`Check-in at ${format(new Date(checkin.checkin_time), 'h:mm a')}`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                {checkin.location_verified && (
                  <div className="absolute -top-1 -right-1 bg-success text-white rounded-full p-0.5">
                    <MapPin className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {format(new Date(checkin.checkin_time), 'MMMM d, yyyy')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(checkin.checkin_time), 'h:mm a')}
                </p>
                {checkin.status === 'rejected' && checkin.rejection_reason && (
                  <p className="mt-1 text-xs text-error">
                    Reason: {checkin.rejection_reason}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                ${checkin.status === 'approved' ? 'bg-success/10 text-success' :
                  checkin.status === 'rejected' ? 'bg-error/10 text-error' :
                  'bg-warning/10 text-warning'}
              `}>
                {checkin.status === 'approved' ? (
                  <>
                    <Check className="h-3 w-3" />
                    Approved
                  </>
                ) : checkin.status === 'rejected' ? (
                  <>
                    <X className="h-3 w-3" />
                    Rejected
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3" />
                    Pending
                  </>
                )}
              </span>
              {checkin.verified_by && (
                <img
                  src={checkin.verified_by.avatar_url}
                  alt={checkin.verified_by.name}
                  className="w-6 h-6 rounded-full"
                  title={`Verified by ${checkin.verified_by.name}`}
                />
              )}
            </div>
          </div>
        </Card>
      ))}
      {checkins.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No check-in history available</p>
        </div>
      )}
    </div>
  );
}