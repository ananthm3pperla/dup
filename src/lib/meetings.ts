import { supabase } from './supabase';
import { faker } from '@faker-js/faker';
import { analyzeSentiment } from './ai';
import type {
  OneOnOneMeeting,
  MeetingTopic,
  MeetingNote,
  ActionItem,
  MeetingFeedback,
  SuggestedTime,
  RecurringPattern,
  TranscriptionResult
} from '../types/meetings';

// Generate a complete mock meeting with all related data
export function generateCompleteMockMeeting(userId: string): OneOnOneMeeting {
  const isManager = faker.datatype.boolean();
  const scheduledAt = new Date('2025-03-15T09:00:00Z'); // Fixed date for demo
  const otherPerson = {
    id: faker.string.uuid(),
    name: isManager ? 'Sarah Chen' : 'Ananth Mepperla',
    role: isManager ? 'Senior Software Engineer' : 'Engineering Team Lead',
    avatar: isManager ? 
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' :
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };
  const meetingId = faker.string.uuid();
  
  return {
    id: meetingId,
    manager_id: isManager ? userId : otherPerson.id,
    employee_id: isManager ? otherPerson.id : userId,
    manager_name: isManager ? 'Ananth Mepperla' : 'Sarah Chen',
    employee_name: isManager ? 'Sarah Chen' : 'Ananth Mepperla',
    manager_avatar: isManager ? 
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' :
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    employee_avatar: isManager ?
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' :
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    scheduled_at: '2025-03-15T09:00:00Z',
    duration: '30 minutes',
    status: 'scheduled',
    needs_reschedule: true,
    rescheduled_reason: 'Calendar conflict with team standup meeting at 9 AM',
    suggested_times: [
      { suggested_time: '2025-03-15T10:30:00Z' },
      { suggested_time: '2025-03-15T14:00:00Z' },
      { suggested_time: '2025-03-15T15:30:00Z' }
    ],
    recurring_pattern: faker.datatype.boolean() ? {
      frequency: faker.helpers.arrayElement(['weekly', 'biweekly', 'monthly']),
      interval: 1,
      count: faker.number.int({ min: 4, max: 12 })
    } : undefined,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    topics: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
      id: faker.string.uuid(),
      meeting_id: meetingId,
      title: faker.helpers.arrayElement([
        'Sprint Planning Discussion',
        'Architecture Review',
        'Team Alignment',
        'Project Roadmap'
      ]),
      description: faker.lorem.paragraph(),
      is_anonymous: faker.datatype.boolean(),
      submitted_by: faker.datatype.boolean() ? userId : (isManager ? faker.string.uuid() : userId),
      created_at: faker.date.recent().toISOString(),
      updated_at: faker.date.recent().toISOString()
    })),
    notes: Array.from({ length: 2 }, () => ({
      id: faker.string.uuid(),
      meeting_id: meetingId,
      content: faker.lorem.paragraphs(2),
      created_by: faker.datatype.boolean() ? userId : (isManager ? faker.string.uuid() : userId),
      created_at: faker.date.recent().toISOString(),
      updated_at: faker.date.recent().toISOString()
    })),
    action_items: Array.from({ length: 3 }, () => ({
      id: faker.string.uuid(),
      meeting_id: meetingId,
      title: faker.helpers.arrayElement([
        'Update sprint board with new tasks',
        'Share architecture diagrams',
        'Schedule follow-up with design team'
      ]),
      description: faker.lorem.sentence(),
      assigned_to: faker.datatype.boolean() ? userId : (isManager ? faker.string.uuid() : userId),
      due_date: faker.date.future({ days: 7 }).toISOString(),
      status: faker.helpers.arrayElement(['pending', 'in_progress', 'completed', 'blocked']),
      created_at: faker.date.recent().toISOString(),
      updated_at: faker.date.recent().toISOString()
    })),
    feedback: Array.from({ length: 1 }, () => ({
      id: faker.string.uuid(),
      meeting_id: meetingId,
      rating: faker.number.int({ min: 1, max: 5 }),
      sentiment: faker.helpers.arrayElement(['positive', 'neutral', 'negative']),
      comments: faker.lorem.paragraph(),
      is_anonymous: faker.datatype.boolean(),
      submitted_by: faker.datatype.boolean() ? userId : (isManager ? faker.string.uuid() : userId),
      created_at: faker.date.recent().toISOString()
    }))
  };
}

// Generate multiple complete mock meetings
export function generateCompleteMockMeetings(userId: string, count: number = 5): OneOnOneMeeting[] {
  return Array.from({ length: count }, () => generateCompleteMockMeeting(userId));
}


// Meeting Management
export async function scheduleMeeting(
  managerId: string,
  employeeId: string,
  scheduledAt: string,
  duration: string = '30 minutes',
  recurringPattern?: RecurringPattern
): Promise<OneOnOneMeeting> {
  const { data, error } = await supabase
    .from('one_on_one_meetings')
    .insert({
      manager_id: managerId,
      employee_id: employeeId,
      scheduled_at: scheduledAt,
      duration,
      recurring_pattern: recurringPattern
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMeetingById(id: string): Promise<OneOnOneMeeting> {
  try {
    // First check if we're in demo mode by checking localStorage
    const mockMeetings = localStorage.getItem('mockMeetings');
    if (mockMeetings) {
      const meetings = JSON.parse(mockMeetings);
      const meeting = meetings.find((m: OneOnOneMeeting) => m.id === id);
      if (meeting) {
        return meeting;
      }
    }

    // First check if meeting exists and user has access
    const { data: meeting, error: meetingError } = await supabase
      .from('one_on_one_meetings')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (meetingError) throw meetingError;
    if (!meeting) throw new Error('Meeting not found');

    // Use the helper function to get all related data
    const { data: details, error: detailsError } = await supabase 
      .rpc('get_meeting_details', { 
        p_meeting_id: id,
        p_user_id: supabase.auth.user()?.id 
      });

    if (detailsError) throw detailsError;
    if (!details) throw new Error('Failed to load meeting details');

    return {
      ...details.meeting,
      topics: details.topics,
      notes: details.notes,
      action_items: details.action_items,
      feedback: details.feedback
    };
  } catch (err) {
    console.error('Error loading meeting:', err);
    throw new Error('Failed to load meeting details');
  }
}

export async function getUserMeetings(
  userId: string,
  startDate: string,
  endDate: string
): Promise<OneOnOneMeeting[]> {
  try {
    const { data, error } = await supabase
      .from('one_on_one_meetings')
      .select('*')
      .or(`manager_id.eq.${userId},employee_id.eq.${userId}`)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    const meetings = data || [];

    // Fetch related data for each meeting
    const meetingsWithData = await Promise.all(
      meetings.map(async (meeting) => {
        try {
          const [topics, notes, actionItems, feedback] = await Promise.all([
            supabase.from('meeting_topics').select('*').eq('meeting_id', meeting.id),
            supabase.from('meeting_notes').select('*').eq('meeting_id', meeting.id),
            supabase.from('action_items').select('*').eq('meeting_id', meeting.id),
            supabase.from('meeting_feedback').select('*').eq('meeting_id', meeting.id)
          ]);

          return {
            ...meeting,
            topics: topics.data || [],
            notes: notes.data || [],
            action_items: actionItems.data || [],
            feedback: feedback.data || []
          };
        } catch (err) {
          console.error(`Error fetching related data for meeting ${meeting.id}:`, err);
          // Return meeting without related data rather than failing completely
          return meeting;
        }
      })
    );

    return meetingsWithData;
  } catch (err) {
    console.error('Error fetching meetings:', err);
    throw new Error('Failed to load meetings');
  }
}

export async function rescheduleMeeting(
  meetingId: string,
  newScheduledAt: string,
  reason?: string
): Promise<OneOnOneMeeting> {
  try {
    // For demo mode, update mock meeting
    const mockMeetings = localStorage.getItem('mockMeetings');
    if (mockMeetings) {
      const meetings = JSON.parse(mockMeetings);
      const updatedMeetings = meetings.map((m: OneOnOneMeeting) => {
        if (m.id === meetingId) {
          return {
            ...m,
            scheduled_at: newScheduledAt,
            status: 'scheduled',
            needs_reschedule: false,
            rescheduled_from: m.scheduled_at,
            rescheduled_reason: reason,
            updated_at: new Date().toISOString()
          };
        }
        return m;
      });
      localStorage.setItem('mockMeetings', JSON.stringify(updatedMeetings));
      return updatedMeetings.find((m: OneOnOneMeeting) => m.id === meetingId);
    }

    // Real API call
    const { data, error } = await supabase
      .from('one_on_one_meetings')
      .update({
        scheduled_at: newScheduledAt,
        status: 'scheduled',
        needs_reschedule: false,
        rescheduled_from: meeting.scheduled_at,
        rescheduled_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', meetingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error rescheduling meeting:', err);
    throw new Error('Failed to reschedule meeting');
  }
}

export async function cancelMeeting(meetingId: string): Promise<void> {
  const { error } = await supabase
    .from('one_on_one_meetings')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', meetingId);

  if (error) throw error;
}

// Topics Management
export async function addMeetingTopic(
  meetingId: string,
  title: string,
  description?: string,
  isAnonymous: boolean = false
): Promise<MeetingTopic> {
  const { data, error } = await supabase
    .from('meeting_topics')
    .insert({
      meeting_id: meetingId,
      title,
      description,
      is_anonymous: isAnonymous
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMeetingTopics(meetingId: string): Promise<MeetingTopic[]> {
  const { data, error } = await supabase
    .from('meeting_topics')
    .select()
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Notes Management
export async function addMeetingNote(
  meetingId: string,
  content: string
): Promise<MeetingNote> {
  const { data, error } = await supabase
    .from('meeting_notes')
    .insert({
      meeting_id: meetingId,
      content
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMeetingNotes(meetingId: string): Promise<MeetingNote[]> {
  const { data, error } = await supabase
    .from('meeting_notes')
    .select()
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Action Items Management
export async function addActionItem(
  meetingId: string,
  title: string,
  assignedTo: string,
  dueDate: string,
  description?: string
): Promise<ActionItem> {
  const { data, error } = await supabase
    .from('action_items')
    .insert({
      meeting_id: meetingId,
      title,
      assigned_to: assignedTo,
      due_date: dueDate,
      description
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateActionItemStatus(
  actionItemId: string,
  status: ActionItem['status']
): Promise<ActionItem> {
  const { data, error } = await supabase
    .from('action_items')
    .update({ status })
    .eq('id', actionItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActionItems(
  meetingId?: string,
  assignedTo?: string
): Promise<ActionItem[]> {
  let query = supabase.from('action_items').select();

  if (meetingId) {
    query = query.eq('meeting_id', meetingId);
  }
  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo);
  }

  const { data, error } = await query.order('due_date', { ascending: true });

  if (error) throw error;
  return data;
}

// Feedback Management
export async function submitFeedback(
  meetingId: string,
  rating: number,
  sentiment: MeetingFeedback['sentiment'],
  comments?: string,
  isAnonymous: boolean = false
): Promise<MeetingFeedback> {
  const { data, error } = await supabase
    .from('meeting_feedback')
    .insert({
      meeting_id: meetingId,
      rating,
      sentiment,
      comments,
      is_anonymous: isAnonymous
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMeetingFeedback(meetingId: string): Promise<MeetingFeedback[]> {
  const { data, error } = await supabase
    .from('meeting_feedback')
    .select()
    .eq('meeting_id', meetingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Scheduling Helpers
export async function checkMeetingConflicts(
  userId: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_meeting_conflicts', {
      p_user_id: userId,
      p_start_time: startTime,
      p_end_time: endTime
    });

  if (error) throw error;
  return data;
}

export async function suggestMeetingTimes(
  managerId: string,
  employeeId: string,
  preferredDate: string,
  duration: string = '30 minutes'
): Promise<SuggestedTime[]> {
  // For demo mode, use mock suggested times
  if (managerId === '3dfadd8d-cf2d-40da-a62f-8049d8a38820' || employeeId === '3dfadd8d-cf2d-40da-a62f-8049d8a38820') {
    const date = new Date(preferredDate);
    return Array.from({ length: 6 }, (_, i) => {
      const time = new Date(date);
      time.setHours(9 + Math.floor(i / 2), (i % 2) * 30, 0, 0);
      return {
        suggested_time: time.toISOString()
      };
    });
  }

  const { data, error } = await supabase
    .rpc('suggest_meeting_times', {
      p_manager_id: managerId,
      p_employee_id: employeeId,
      p_preferred_date: preferredDate,
      p_duration: duration
    });

  if (error) throw error;
  return data;
}

// Placeholder for Voice-to-Text Transcription
export async function transcribeMeetingAudio(audioBlob: Blob): Promise<TranscriptionResult> {
  try {
    // Placeholder implementation until proper speech-to-text service is configured
    console.log('Transcription requested for audio blob:', audioBlob.size);
    return {
      text: 'Transcription service not yet implemented',
      confidence: 0
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe meeting audio');
  }
}

// Enhanced Sentiment Analysis
export async function analyzeSentiment(text: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}> {
  try {
    // Use natural language processing for basic sentiment analysis
    const words = text.toLowerCase().split(/\s+/);
    
    const positiveWords = new Set(['great', 'excellent', 'good', 'happy', 'productive']);
    const negativeWords = new Set(['bad', 'poor', 'unhappy', 'unproductive', 'difficult']);
    
    let score = 0;
    let matchedWords = 0;
    
    words.forEach(word => {
      if (positiveWords.has(word)) {
        score += 1;
        matchedWords++;
      } else if (negativeWords.has(word)) {
        score -= 1;
        matchedWords++;
      }
    });
    
    const confidence = matchedWords / words.length;
    const normalizedScore = score / (matchedWords || 1);
    
    return {
      sentiment: normalizedScore > 0.2 ? 'positive' : 
                 normalizedScore < -0.2 ? 'negative' : 
                 'neutral',
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