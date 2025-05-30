import { createClient } from '@supabase/supabase-js';
import { isDemoMode } from './demo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client with improved session configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true, // Enable session persistence (default true)
    autoRefreshToken: true, // Refresh token automatically (default true)
    detectSessionInUrl: true, // Detect OAuth session in URL (default true)
    storageKey: 'hi-bridge-auth', // Custom storage key for better control
    storage: {
      getItem: (key) => {
        try {
          return sessionStorage.getItem(key) || localStorage.getItem(key);
        } catch (error) {
          console.error('Error accessing storage for auth', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          // Store auth tokens in sessionStorage for better security
          sessionStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting storage for auth', error);
        }
      },
      removeItem: (key) => {
        try {
          // Clear from both storages to ensure complete cleanup
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing storage for auth', error);
        }
      }
    },
  },
});

// Generate invite link for teams
export const generateInviteLink = (inviteCode: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/join-team?code=${inviteCode}`;
};

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, options?: { full_name?: string }) => {
  // Explicitly use current site URL for redirect
  const site_url = window.location.origin;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: options?.full_name
      },
      emailRedirectTo: `${site_url}/auth/callback`
    }
  });
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const site_url = window.location.origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${site_url}/auth/callback`
    }
  });
  if (error) throw error;
  return data;
};

export const signInWithMicrosoft = async () => {
  const site_url = window.location.origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${site_url}/auth/callback`
    }
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  try {
    // Clear all auth-related cookies and storage
    await supabase.auth.signOut({ scope: 'global' });
    
    // Manual cleanup for additional safety
    sessionStorage.removeItem('hi-bridge-auth');
    localStorage.removeItem('hi-bridge-auth');
    
    // Also clean up old auth keys that might be present
    sessionStorage.removeItem('sb-fpzycszcvxxbnmsrsvoa-auth-token');
    localStorage.removeItem('sb-fpzycszcvxxbnmsrsvoa-auth-token');
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  const site_url = window.location.origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site_url}/reset-password`
  });
  if (error) throw error;
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
};

export const resendVerificationEmail = async (email: string) => {
  const site_url = window.location.origin;
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${site_url}/auth/callback`
    }
  });
  if (error) throw error;
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserAvatar = async (userId: string, filePath: string, file: File) => {
  // Upload the file to storage
  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (uploadError) throw uploadError;
  
  // Get the public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath);
  
  // Update the user's avatar_url
  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl }
  });
  
  if (updateError) throw updateError;
  
  return publicUrl;
};

// Function to verify session is still valid
export const verifySession = async () => {
  try {
    // If in demo mode, return simulated valid session
    if (isDemoMode()) {
      return { 
        valid: true, 
        user: { id: 'demo-user-id' } 
      };
    }
    
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return { valid: true, user: data.user };
  } catch (error) {
    console.error('Session verification error:', error);
    return { valid: false, error };
  }
};

// Exponential backoff helper
const backoff = (retryCount: number, baseDelay: number = 1000, maxDelay: number = 10000) => {
  const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  // Add jitter to prevent synchronized retries
  return delay + (Math.random() * 1000);
};

// Function to refresh session if possible with retry mechanism
export const refreshSession = async () => {
  // If in demo mode, return a simulated successful session
  if (isDemoMode()) {
    return { 
      success: true, 
      session: { 
        user: { id: 'demo-user-id' },
        expires_at: Date.now() + 3600000 // Expires in one hour
      } 
    };
  }
  
  let retries = 0;
  const maxRetries = 3;
  
  while (retries <= maxRetries) {
    try {
      // First check if we have a session to refresh
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.warn('No session to refresh');
        return { success: false, session: null, error: new Error('Auth session missing!') };
      }
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        // If we hit a rate limit, retry with backoff
        if (error.message.includes('rate limit') || error.status === 429) {
          console.warn(`Rate limit hit, retry ${retries + 1}/${maxRetries + 1}`);
          
          if (retries < maxRetries) {
            const delayTime = backoff(retries);
            retries++;
            await new Promise(resolve => setTimeout(resolve, delayTime));
            continue;
          }
        }
        
        throw error;
      }
      
      return { success: true, session: data.session };
    } catch (error) {
      if (retries < maxRetries && 
          (error.message?.includes('rate limit') || 
           error.status === 429 || 
           error.message?.includes('network') ||
           error.message?.includes('timeout'))) {
        const delayTime = backoff(retries);
        retries++;
        await new Promise(resolve => setTimeout(resolve, delayTime));
        continue;
      }
      
      console.error('Session refresh error:', error);
      return { success: false, session: null, error };
    }
  }
  
  return { 
    success: false, 
    session: null, 
    error: new Error('Failed to refresh session after multiple attempts')
  };
};

// Function to safely get the current user
export const getCurrentUser = async () => {
  // If in demo mode, return a demo user
  if (isDemoMode()) {
    return { 
      user: { 
        id: 'demo-user-id',
        email: 'demo@example.com',
        user_metadata: {
          full_name: 'Demo User'
        }
      } 
    };
  }
  
  try {
    // First try to get from memory
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      // If no user in memory, try to refresh the session
      const refreshResult = await refreshSession();
      if (!refreshResult.success) {
        return { user: null };
      }
      
      // If refresh successful, get user again
      const refreshedUser = await supabase.auth.getUser();
      return { user: refreshedUser.data.user };
    }
    
    return { user: data.user };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null };
  }
};