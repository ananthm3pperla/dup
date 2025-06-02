
// Placeholder supabase module for Hi-Bridge
// This app uses Replit Database instead of Supabase

/**
 * Placeholder functions for compatibility with existing code
 * All actual authentication and data operations go through the Replit backend
 */

// Create a mock client to prevent "supabaseUrl is required" errors
const createMockClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: any) => {
      // Return a mock subscription object
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('Mock auth subscription unsubscribed');
            }
          }
        }
      };
    },
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    resetPasswordForEmail: async () => ({ data: null, error: null }),
  },
  from: (table: string) => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    eq: () => ({ data: [], error: null }),
    order: () => ({ data: [], error: null }),
    limit: () => ({ data: [], error: null }),
  }),
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    subscribe: () => {},
    unsubscribe: () => {},
  }),
});

export const supabase = createMockClient();

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
