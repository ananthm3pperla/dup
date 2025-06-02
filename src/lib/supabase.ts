// Placeholder supabase module for Hi-Bridge
// This app uses Replit Database instead of Supabase

/**
 * Placeholder functions for compatibility with existing code
 * All actual authentication and data operations go through the Replit backend
 */

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
};

// Placeholder exports for backward compatibility
export const refreshSession = async () => {
  console.warn('refreshSession called but using Replit backend');
  return null;
};

export const getSession = async () => {
  console.warn('getSession called but using Replit backend');
  return null;
};

export default supabase;