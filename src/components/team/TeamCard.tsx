import { OneOnOneMeeting } from "../../lib/types";
import { generateCompleteMockMeetings } from "../../lib/mockData";

// Analyze sentiment from meeting notes
export async function analyzeSentiment(text: string): Promise<{ sentiment: string; confidence: number }> {
  try {
    // Mock implementation for sentiment analysis
    const sentiments = ['positive', 'neutral', 'negative'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const confidence = Math.random();
    
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