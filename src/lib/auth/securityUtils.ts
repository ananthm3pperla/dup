import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Check if two-factor authentication is enabled for a user
 * @param userId User ID to check
 * @returns boolean indicating if 2FA is enabled
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  try {
    // In a real application, this would check if 2FA is enabled in the database
    // For demo purposes, we'll simulate this with a 50/50 chance
    return Math.random() > 0.5;
  } catch (error) {
    console.error('Error checking two-factor status:', error);
    return false;
  }
}

/**
 * Get user security preferences from the database
 */
export async function getUserSecurityPreferences(userId: string): Promise<{
  hasTwoFactor: boolean;
  hasSecurityQuestions: boolean;
  hasRecoveryEmail: boolean;
  lastPasswordChange: string | null;
}> {
  try {
    // In a real application, this would query the database for user security preferences
    // For demo purposes, we'll return mock data
    return {
      hasTwoFactor: false,
      hasSecurityQuestions: false,
      hasRecoveryEmail: false,
      lastPasswordChange: null
    };
  } catch (error) {
    console.error('Error getting user security preferences:', error);
    return {
      hasTwoFactor: false,
      hasSecurityQuestions: false,
      hasRecoveryEmail: false,
      lastPasswordChange: null
    };
  }
}

/**
 * Check if a user's email is verified
 */
export async function isEmailVerified(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  // Directly check from user object if email_confirmed_at exists
  if (user.email_confirmed_at) {
    return true;
  }
  
  // Alternatively, query the user again to get the latest status
  try {
    const { data } = await supabase.auth.getUser();
    return !!data.user?.email_confirmed_at;
  } catch (error) {
    console.error('Error checking email verification status:', error);
    return false;
  }
}

/**
 * Check the strength of a password
 * @returns A score from 0-4
 */
export function checkPasswordStrength(password: string): number {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  return score;
}

/**
 * Check for account security risks
 */
export function detectSecurityRisks(user: User | null): string[] {
  const risks: string[] = [];
  
  if (!user) return risks;
  
  // Check if email is verified
  if (!user.email_confirmed_at) {
    risks.push('Email not verified');
  }
  
  // Add other risk checks here
  
  return risks;
}