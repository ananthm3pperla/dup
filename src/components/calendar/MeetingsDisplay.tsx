import React from 'react';
import { format } from 'date-fns';
import { Users, Video, ExternalLink, MapPin, Clock } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { motion } from 'framer-motion';

export interface MeetingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: number;
  description?: string;
  videoLink?: string;
}

interface MeetingsDisplayProps {
  meetings: MeetingEvent[];
  date?: Date;
}

export default function MeetingsDisplay({ meetings, date }: MeetingsDisplayProps) {
  // Filter meetings for the specified date if provided
  const filteredMeetings = date 
    ? meetings.filter(meeting => {
        const meetingDate = new Date(meeting.start);
        return meetingDate.getDate() === date.getDate() &&
               meetingDate.getMonth() === date.getMonth() &&
               meetingDate.getFullYear() === date.getFullYear();
      })
    : meetings;
    
  // Sort meetings by start time
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
  
  if (sortedMeetings.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <p>No meetings scheduled {date ? `for ${format(date, 'MMMM d')}` : ''}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium text-default">
        {date ? `Meetings on ${format(date, 'MMMM d')}` : 'Upcoming Meetings'}
      </h3>
      {sortedMeetings.map((meeting, index) => (
        <motion.div
          key={meeting.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-default text-sm">{meeting.title}</h4>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(meeting.start), 'h:mm a')} - {format(new Date(meeting.end), 'h:mm a')}</span>
                  </div>
                  
                  {meeting.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{meeting.location}</span>
                    </div>
                  )}
                  
                  {meeting.attendees && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{meeting.attendees} attendees</span>
                    </div>
                  )}
                </div>
                
                {meeting.description && (
                  <p className="mt-2 text-xs text-muted line-clamp-2">{meeting.description}</p>
                )}
              </div>
              
              {meeting.videoLink && (
                <a 
                  href={meeting.videoLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-shrink-0"
                >
                  <Badge 
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <span>Join</span>
                    <ExternalLink className="h-3 w-3" />
                  </Badge>
                </a>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}