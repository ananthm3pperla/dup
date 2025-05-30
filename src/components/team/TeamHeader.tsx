import React from 'react';
import { OneOnOneMeeting } from '../../types/types';

interface TeamHeaderProps {
  teamName: string;
  memberCount: number;
}

// Sentiment analysis function
export async function analyzeSentiment(text: string): Promise<{ sentiment: string; confidence: number }> {
  try {
    // Implementation will be added when sentiment API is configured
    const sentiment = 'neutral';
    const confidence = 0.5;
    
    return {
      sentiment,
      confidence: Math.min(confidence * 2, 1) // Scale confidence but cap at 1
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    throw new Error('Failed to analyze sentiment');
  }
}

// Calendar Integration
export async function syncWithCalendar(
  meeting: OneOnOneMeeting,
  calendarType: 'google' | 'outlook'
): Promise<void> {
  // Implementation will be added when calendar providers are configured
  throw new Error('Calendar sync not yet implemented');
}

// Generate mock meetings for demo mode
export function generateMockMeetings(userId: string, count: number = 5): OneOnOneMeeting[] {
  const meetings = generateCompleteMockMeetings(userId, count);
  
  // Store mock meetings in localStorage for persistence
  localStorage.setItem('mockMeetings', JSON.stringify(meetings));
  
  return meetings;
}

// Helper function for mock meetings
function generateCompleteMockMeetings(userId: string, count: number): OneOnOneMeeting[] {
  // This is a placeholder implementation
  return Array(count).fill(null).map((_, index) => ({
    id: `mock-meeting-${index}`,
    title: `Mock Meeting ${index + 1}`,
    userId,
    attendeeId: `mock-attendee-${index}`,
    date: new Date(Date.now() + (index * 86400000)).toISOString(),
    notes: `Mock notes for meeting ${index + 1}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

const TeamHeader: React.FC<TeamHeaderProps> = ({ teamName, memberCount }) => {
  return (
    <div className="team-header">
      <h1>{teamName}</h1>
      <p>{memberCount} members</p>
    </div>
  );
};

export default TeamHeader;