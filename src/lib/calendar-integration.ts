import { toast } from 'sonner';
import { supabase } from './supabase';

// Types for calendar events
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  attendees?: number;
  videoLink?: string;
  calendarId?: string;
}

// Store connected calendar providers
interface ConnectedCalendar {
  provider: 'google' | 'microsoft';
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  calendarId?: string;
}

// Google Calendar API configuration
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// Microsoft Graph API configuration
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
const MICROSOFT_REDIRECT_URI = `${window.location.origin}/auth/microsoft-callback`;
const MICROSOFT_SCOPES = 'Calendars.Read';

// Check if calendar is connected
export async function isCalendarConnected(userId: string): Promise<boolean> {
  try {
    // Check if we have a stored token
    const { data, error } = await supabase
      .from('user_calendar_connections')
      .select('provider, expires_at')
      .eq('user_id', userId)
      .single();
      
    if (error) return false;
    
    // Check if token is expired
    if (data && data.expires_at) {
      const expiresAt = new Date(data.expires_at).getTime();
      if (expiresAt > Date.now()) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking calendar connection:', error);
    return false;
  }
}

// Connect to Google Calendar
export async function connectGoogleCalendar(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      // Check if Google API is loaded
      if (!window.gapi) {
        toast.error('Google API not loaded');
        reject(new Error('Google API not loaded'));
        return;
      }
      
      // Load the auth2 library
      window.gapi.load('client:auth2', async () => {
        try {
          // Initialize the client
          await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPES,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
          });
          
          // Sign in the user
          const authInstance = window.gapi.auth2.getAuthInstance();
          const isSignedIn = authInstance.isSignedIn.get();
          
          if (!isSignedIn) {
            const user = await authInstance.signIn();
            if (!user) {
              reject(new Error('Failed to sign in with Google'));
              return;
            }
          }
          
          // Get the access token
          const currentUser = authInstance.currentUser.get();
          const authResponse = currentUser.getAuthResponse();
          
          // Store the token in Supabase
          const { error } = await supabase.from('user_calendar_connections').upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            provider: 'google',
            access_token: authResponse.access_token,
            refresh_token: '', // Google doesn't provide refresh token in this flow
            expires_at: new Date(authResponse.expires_at * 1000).toISOString(),
            calendar_id: 'primary'
          });
          
          if (error) {
            console.error('Error storing Google calendar token:', error);
            reject(error);
            return;
          }
          
          resolve(true);
        } catch (error) {
          console.error('Error initializing Google client:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      reject(error);
    }
  });
}

// Connect to Microsoft Calendar
export async function connectMicrosoftCalendar(): Promise<boolean> {
  try {
    // Microsoft authentication endpoint
    const authEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    
    // Generate a random state value for security
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem('msft_auth_state', state);
    
    // Build the authorization URL
    const authUrl = new URL(authEndpoint);
    authUrl.searchParams.append('client_id', MICROSOFT_CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', MICROSOFT_REDIRECT_URI);
    authUrl.searchParams.append('scope', MICROSOFT_SCOPES);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('response_mode', 'query');
    
    // Redirect to Microsoft login
    window.location.href = authUrl.toString();
    
    // This will redirect the user away from the page, so we won't actually reach this point
    // The actual token exchange happens in the callback page
    return true;
  } catch (error) {
    console.error('Error connecting to Microsoft Calendar:', error);
    throw error;
  }
}

// Fetch events from Google Calendar
export async function fetchGoogleCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  try {
    // Check if Google API is loaded
    if (!window.gapi || !window.gapi.client || !window.gapi.client.calendar) {
      throw new Error('Google Calendar API not loaded');
    }
    
    // Get the user's calendar events
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    // Transform the response into our CalendarEvent format
    return (response.result.items || []).map(event => ({
      id: event.id || '',
      title: event.summary || 'Untitled Event',
      start: new Date(event.start?.dateTime || event.start?.date || ''),
      end: new Date(event.end?.dateTime || event.end?.date || ''),
      location: event.location,
      description: event.description,
      attendees: event.attendees?.length || 0,
      videoLink: event.hangoutLink,
      calendarId: 'primary'
    }));
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
}

// Fetch events from Microsoft Calendar
export async function fetchMicrosoftCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  try {
    // Get the access token from Supabase
    const { data: connection, error } = await supabase
      .from('user_calendar_connections')
      .select('access_token, expires_at')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('provider', 'microsoft')
      .single();
      
    if (error || !connection) {
      throw new Error('Microsoft Calendar not connected');
    }
    
    // Check if token is expired
    const expiresAt = new Date(connection.expires_at).getTime();
    if (expiresAt <= Date.now()) {
      throw new Error('Microsoft Calendar token expired');
    }
    
    // Format dates for Microsoft Graph API
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Fetch events from Microsoft Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${startDateStr}&endDateTime=${endDateStr}`,
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Microsoft API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the response into our CalendarEvent format
    return (data.value || []).map((event: any) => ({
      id: event.id || '',
      title: event.subject || 'Untitled Event',
      start: new Date(event.start.dateTime + 'Z'),
      end: new Date(event.end.dateTime + 'Z'),
      location: event.location?.displayName,
      description: event.bodyPreview,
      attendees: event.attendees?.length || 0,
      videoLink: event.onlineMeeting?.joinUrl,
      calendarId: event.calendar?.id
    }));
  } catch (error) {
    console.error('Error fetching Microsoft Calendar events:', error);
    throw error;
  }
}

// Fetch events from the connected calendar
export async function fetchCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  try {
    // Get the user's connected calendar
    const { data: connection, error } = await supabase
      .from('user_calendar_connections')
      .select('provider')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();
      
    if (error || !connection) {
      throw new Error('No calendar connected');
    }
    
    // Fetch events from the appropriate provider
    if (connection.provider === 'google') {
      return fetchGoogleCalendarEvents(startDate, endDate);
    } else if (connection.provider === 'microsoft') {
      return fetchMicrosoftCalendarEvents(startDate, endDate);
    } else {
      throw new Error(`Unsupported calendar provider: ${connection.provider}`);
    }
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

// Disconnect calendar
export async function disconnectCalendar(): Promise<boolean> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Get the current connection
    const { data: connection, error: fetchError } = await supabase
      .from('user_calendar_connections')
      .select('provider')
      .eq('user_id', userId)
      .single();
      
    if (fetchError) {
      throw fetchError;
    }
    
    // Revoke access if Google
    if (connection?.provider === 'google' && window.gapi) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
      }
    }
    
    // Delete the connection from Supabase
    const { error: deleteError } = await supabase
      .from('user_calendar_connections')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      throw deleteError;
    }
    
    return true;
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    throw error;
  }
}