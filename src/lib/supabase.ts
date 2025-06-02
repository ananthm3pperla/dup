// This file is now deprecated - using native Replit auth instead
// All auth functionality has been moved to src/lib/auth.ts

export const supabase = null;

// Legacy exports for compatibility
export const refreshSession = async () => {
  throw new Error('Supabase has been replaced with native auth');
};

export const getCurrentUser = async () => {
  throw new Error('Use auth.getCurrentUser() instead');
};

export const signOut = async () => {
  throw new Error('Use auth.logout() instead');
};