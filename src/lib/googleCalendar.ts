import { format, addMinutes } from 'date-fns';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
}

export interface DayMeetings {
  date: string;
  totalMeetings: number;
  totalDuration: number;
  events: CalendarEvent[];
}

// Mock meeting titles for realistic data
const meetingTitles = [
  'Team Standup',
  'Product Review',
  'Architecture Discussion',
  'Client Meeting',
  'Sprint Planning',
  'Tech Review',
  'All Hands',
  'Department Sync',
  'Strategy Session',
  'Project Update'
];

class GoogleCalendarClient {
  private authorized: boolean = false;

  constructor() {
    // Initialize with mock data
    console.log('Initialized mock Google Calendar client');
  }

  async authorize() {
    // Simulate authorization delay
    await new Promise(resolve => setTimeout(resolve, 500));
    this.authorized = true;
    console.log('Mock authorization successful');
  }

  private generateMockMeetings(date: Date): CalendarEvent[] {
    // Generate 2-4 meetings per day
    const numMeetings = Math.floor(Math.random() * 3) + 2;
    const meetings: CalendarEvent[] = [];
    
    // Start times between 9 AM and 4 PM
    const startHour = 9;
    const endHour = 16;
    
    for (let i = 0; i < numMeetings; i++) {
      // Random start time between 9 AM and 4 PM
      const hour = startHour + Math.floor(Math.random() * (endHour - startHour));
      const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
      
      const start = new Date(date);
      start.setHours(hour, minutes, 0, 0);
      
      // Duration between 30 and 90 minutes
      const durationMinutes = [30, 45, 60, 90][Math.floor(Math.random() * 4)];
      const end = addMinutes(start, durationMinutes);
      
      meetings.push({
        id: `mock-meeting-${date.toISOString()}-${i}`,
        summary: meetingTitles[Math.floor(Math.random() * meetingTitles.length)],
        start,
        end,
        isAllDay: false
      });
    }
    
    return meetings;
  }

  async getWeekEvents(startDate: Date, endDate: Date): Promise<DayMeetings[]> {
    if (!this.authorized) {
      throw new Error('Not authorized');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const dayMeetings: DayMeetings[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const events = this.generateMockMeetings(currentDate);
      const totalDuration = events.reduce((sum, event) => 
        sum + (event.end.getTime() - event.start.getTime()) / (1000 * 60), 0);

      dayMeetings.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        totalMeetings: events.length,
        totalDuration,
        events
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dayMeetings;
  }
}

export const googleCalendar = new GoogleCalendarClient();