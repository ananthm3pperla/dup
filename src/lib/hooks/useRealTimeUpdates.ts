
import { useState, useEffect, useCallback } from 'react';

interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: string;
}

/**
 * Hook to simulate real-time updates for Hi-Bridge features
 */
export function useRealTimeUpdates(userId: string) {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate WebSocket connection
  useEffect(() => {
    if (!userId) return;

    setIsConnected(true);

    // Simulate periodic updates
    const interval = setInterval(() => {
      const eventTypes = [
        'pulse_submitted',
        'team_checkin',
        'leaderboard_update',
        'office_capacity_change'
      ];

      const randomEvent: RealTimeEvent = {
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        data: {
          userId: `user-${Math.floor(Math.random() * 100)}`,
          message: 'Real-time update received',
          value: Math.floor(Math.random() * 100)
        },
        timestamp: new Date().toISOString()
      };

      setEvents(prev => [randomEvent, ...prev.slice(0, 49)]); // Keep last 50 events
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [userId]);

  const sendEvent = useCallback((type: string, data: any) => {
    const event: RealTimeEvent = {
      type,
      data,
      timestamp: new Date().toISOString()
    };
    
    setEvents(prev => [event, ...prev.slice(0, 49)]);
  }, []);

  return {
    events,
    isConnected,
    sendEvent
  };
}
