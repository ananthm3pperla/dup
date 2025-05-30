import { supabase } from './supabase';
import { z } from 'zod';
import { passwordSchema } from './security';
import { toast } from 'sonner';
import { initializeDemoMode, DEMO_USER } from './demo';

// Input validation schemas
export const userSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email cannot exceed 255 characters')
    .transform(email => email.toLowerCase()),
  password: passwordSchema,
  full_name: z.string()
    .min(1, 'Name must be at least 1 character')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Demo mode login simulation
export async function loginWithDemo() {
  try {
    // Initialize demo mode
    initializeDemoMode();
    
    // Simulate a successful login with demo user data
    return {
      user: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        user_metadata: {
          full_name: DEMO_USER.full_name
        },
        app_metadata: {
          provider: 'demo'
        },
        aud: 'authenticated',
        role: 'authenticated'
      }
    };
  } catch (error) {
    console.error('Demo login error:', error);
    throw error;
  }
}

// User registration with enhanced error handling and retry logic
export async function registerUser(email: string, password: string, full_name: string) {
  let retries = 0;
  let lastError: Error | null = null;
  
  while (retries <= MAX_RETRIES) {
    try {
      // Validate and sanitize input
      const validatedData = userSchema.parse({ email, password, full_name });
      
      console.log("Signup validation passed:", { 
        email: validatedData.email, 
        full_name: validatedData.full_name 
      });

      // Show toast for retry attempts
      if (retries > 0) {
        toast.info(`Retrying signup (attempt ${retries + 1}/${MAX_RETRIES + 1})...`);
      }

      // Get the current site URL for redirect
      const site_url = window.location.origin;
      
      // Create the auth user using Supabase Auth API
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.full_name,
            email: validatedData.email
          },
          emailRedirectTo: `${site_url}/auth/callback`
        }
      });

      if (signUpError) {
        // Handle user_already_exists error with a friendly message
        if (signUpError.message.includes('User already registered') || 
            signUpError.message.includes('user_already_exists')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        
        // Handle unexpected_failure from Supabase specifically
        if (signUpError.message.includes('unexpected_failure')) {
          console.error('Supabase returned unexpected_failure. Falling back to demo mode for now.', signUpError);
          // If we encounter this specific error, suggest fallback to demo mode
          throw new Error('We\'re experiencing technical difficulties with our registration service. Please try again later or use demo mode to explore the application.');
        }
        
        // Check for specific error types
        if (signUpError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        
        // Handle database errors more specifically
        if (signUpError.message.includes('Database error saving new user')) {
          console.error('Supabase database error details:', {
            error: signUpError,
            attempt: retries + 1,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          });
          
          if (retries < MAX_RETRIES) {
            lastError = signUpError;
            retries++;
            // Simple fixed delay instead of exponential backoff for faster debugging
            const backoffDelay = RETRY_DELAY;
            console.log(`Retrying in ${backoffDelay}ms...`);
            await delay(backoffDelay);
            continue;
          }
          
          throw new Error('We\'re experiencing technical difficulties with our database. Please try again in a few minutes or use social login or demo mode instead.');
        }
        
        console.error('Auth signup error:', signUpError);
        throw new Error(signUpError.message);
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      // Create initial profile and onboarding records
      try {
        // This is done automatically by database triggers, but we can verify it happened
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Error verifying profile creation:', profileError);
          // Not critical, we can continue
        }
        
        // Create profile if needed
        if (!profile) {
          await supabase
            .from('profiles')
            .insert({
              user_id: authData.user.id,
              full_name: validatedData.full_name
            })
            .single();
        }
        
        // Check if onboarding record exists first
        const { data: existingOnboarding, error: onboardingCheckError } = await supabase
          .from('user_onboarding')
          .select('id')
          .eq('user_id', authData.user.id)
          .maybeSingle();
          
        // Only create onboarding record if it doesn't exist
        if (!existingOnboarding && !onboardingCheckError) {
          await supabase
            .from('user_onboarding')
            .upsert({
              user_id: authData.user.id,
              onboarding_completed: false
            }, {
              onConflict: 'user_id'
            })
            .single();
        } else if (onboardingCheckError && onboardingCheckError.code !== 'PGRST116') {
          console.warn('Error checking onboarding record:', onboardingCheckError);
        }
          
      } catch (initError) {
        console.warn('Error creating initial user records:', initError);
        // Not critical, we can continue with signup
      }

      // Return the created user data
      return authData;
    } catch (error) {
      console.error('User registration error:', {
        error,
        attempt: retries + 1,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
      
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.errors[0].message}`);
      } 
      
      // Enhance error messages for better user feedback
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        // Don't retry for validation or already registered errors
        if (message.includes('already exists') || message.includes('validation')) {
          throw error;
        }
        
        if (retries < MAX_RETRIES && 
           (message.includes('database error') || 
            message.includes('unexpected_failure') ||
            message.includes('network error') ||
            message.includes('timeout') ||
            message.includes('fetch failed'))) {
          retries++;
          lastError = error;
          // Simple fixed delay for faster debugging
          const backoffDelay = RETRY_DELAY;
          await delay(backoffDelay);
          continue;
        }
        
        if (message.includes('database error') || message.includes('unexpected_failure')) {
          throw new Error('We\'re experiencing technical difficulties with our database. Please try again in a few minutes or use social login or demo mode instead.');
        }
        
        if (message.includes('network error') || message.includes('fetch failed')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        
        // If we have a previous database error, provide more context
        if (lastError && message.includes('technical difficulties')) {
          throw new Error('Our database is currently experiencing issues. Please try again later or use social login or demo mode instead.');
        }
        
        throw error;
      }
      
      if (retries === MAX_RETRIES) {
        throw new Error('Unable to complete registration after multiple attempts. Please try again later or use demo mode.');
      }
      
      throw error;
    }
  }
  
  throw new Error('Registration failed. Please try again later or use demo mode.');
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please verify your email before logging in. Check your inbox for a verification link.');
      }
      
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// OAuth sign in with better error handling
export async function signInWithProvider(provider: 'google' | 'azure') {
  try {
    // Store the current URL to redirect back after auth error
    sessionStorage.setItem('preAuthURL', window.location.href);
    
    // Construct the redirect URL with error handler
    const redirectTo = `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'consent',
        } : undefined
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`${provider} sign in error:`, error);
    throw error;
  }
}

// Password reset request
export async function requestPasswordReset(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
}

// Password reset confirmation
export async function resetPassword(newPassword: string) {
  try {
    // Validate new password
    passwordSchema.parse(newPassword);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

// Logout
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Verify email
export async function verifyEmail(token: string) {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
}

// Verify two-factor authentication
export async function verifyTwoFactor(code: string) {
  try {
    // This is a placeholder - in a real app, you would verify with Supabase or your auth provider
    // For demo purposes, we'll just check if the code is '123456'
    return { success: code === '123456' };
  } catch (error) {
    console.error('Two-factor verification error:', error);
    throw error;
  }
}