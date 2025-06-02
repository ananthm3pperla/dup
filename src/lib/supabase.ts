// Supabase has been replaced with custom backend
// This file is kept for compatibility but should not be used

export const supabase = null;

// Placeholder function to prevent errors
export function createClient() {
  throw new Error('Supabase client not available - using custom backend');
}