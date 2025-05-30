import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui';

// Define proper types for our events
interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string format
  end: string; // ISO string format
  allDay: boolean;
}

export default function RemoteWorkCalendar() {
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    // Initialize with empty array until we load real data
    setEvents([]);
  }, []);

  const handleDateSelect = (selectInfo: any) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    // Ensure dates are properly formatted as ISO strings
    const start = selectInfo.start.toISOString();
    const end = selectInfo.end.toISOString();

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title: 'Remote Work',
      start,
      end,
      allDay: selectInfo.allDay,
    };

    setEvents(prev => [...prev, newEvent]);
  };

  const handleEventClick = (clickInfo: any) => {
    if (window.confirm(`Are you sure you want to delete this remote work day?`)) {
      setEvents(prev => prev.filter(event => event.id !== clickInfo.event.id));
    }
  };

  return (
    <Card className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'dayGridMonth'
        }}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={false}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
        contentHeight="auto"
        aspectRatio={2}
        expandRows={true}
        stickyHeaderDates={true}
        firstDay={1}
      />
    </Card>
  );
}