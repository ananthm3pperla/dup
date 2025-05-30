import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, ChevronRight, X, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { faker } from '@faker-js/faker';
import { motion } from 'framer-motion';

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  attendees: number;
  location: string;
  type: 'team' | 'strategy' | 'one-on-one';
  description?: string;
  organizer?: string;
  meetingLink?: string;
  platform?: 'Zoom' | 'Microsoft Teams' | 'Google Meet';
}

export default function TodaySchedule() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    const mockMeetings = Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () => {
      const platform = faker.helpers.arrayElement(['Zoom', 'Microsoft Teams', 'Google Meet']);
      const meetingLink = platform === 'Zoom' 
        ? 'https://zoom.us/j/' + faker.number.int({ min: 10000000, max: 99999999 })
        : platform === 'Microsoft Teams'
        ? 'https://teams.microsoft.com/l/meetup-join/' + faker.string.uuid()
        : 'https://meet.google.com/' + faker.string.alphanumeric(12);

      // Create a meeting starting in the current day
      const startHour = 9 + Math.floor(Math.random() * 7); // Between 9 AM and 4 PM
      const startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
      
      const start = new Date();
      start.setHours(startHour, startMinute, 0, 0);
      
      // Duration between 30 and 90 minutes
      const durationMinutes = [30, 45, 60, 90][Math.floor(Math.random() * 4)];
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + durationMinutes);

      return {
        id: faker.string.uuid(),
        title: faker.company.catchPhrase(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        attendees: faker.number.int({ min: 2, max: 12 }),
        location: platform + ' Meeting',
        type: faker.helpers.arrayElement(['team', 'strategy', 'one-on-one']),
        description: faker.lorem.paragraph(),
        organizer: faker.person.fullName(),
        meetingLink,
        platform
      };
    });

    mockMeetings.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    setMeetings(mockMeetings);
    setIsLoading(false);
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center dark:bg-primary/20">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">My Today's Schedule</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Your meetings and events</p>
          </div>
        </div>
        <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            </div>
          ))
        ) : meetings.length > 0 ? (
          meetings.map((meeting) => (
            <motion.div 
              key={meeting.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedMeeting(meeting)}
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer shadow-sm"
            >
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center dark:bg-primary/20 flex-shrink-0">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{meeting.title}</h4>
                <div className="mt-1 flex flex-wrap gap-1 sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {format(new Date(meeting.start_time), 'h:mm a')} - {format(new Date(meeting.end_time), 'h:mm a')}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{meeting.location}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{meeting.attendees} attendees</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">No meetings scheduled for today</p>
          </div>
        )}
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-lg w-full mx-auto border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="pr-8">
                <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white break-words">{selectedMeeting.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Organized by {selectedMeeting.organizer}
                </p>
              </div>
              <button 
                onClick={() => setSelectedMeeting(null)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {format(new Date(selectedMeeting.start_time), 'h:mm a')} - 
                    {format(new Date(selectedMeeting.end_time), 'h:mm a')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{selectedMeeting.attendees} attendees</span>
                </div>
              </div>
              
              <div className="text-xs sm:text-sm">
                <p className="text-gray-500 dark:text-gray-400 mb-2">Description</p>
                <p className="text-gray-700 dark:text-gray-300">{selectedMeeting.description}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              {selectedMeeting.meetingLink && (
                <a
                  href={selectedMeeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  <Video className="h-4 w-4" />
                  Join {selectedMeeting.platform}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button
                onClick={() => setSelectedMeeting(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}