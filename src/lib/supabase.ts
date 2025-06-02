
// Mock Supabase client for Replit-only deployment
// This replaces external Supabase dependency with local Express backend

export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    role: string;
  };
}

export interface MockAuthResponse {
  user: MockUser | null;
  error?: Error;
}

// Mock functions that return appropriate responses
export const createClient = (url?: string, key?: string) => {
  return {
    auth: {
      signUp: async (credentials: any): Promise<MockAuthResponse> => {
        // This would be handled by our Express backend
        return { user: null, error: new Error('Use local auth API') };
      },
      signInWithPassword: async (credentials: any): Promise<MockAuthResponse> => {
        return { user: null, error: new Error('Use local auth API') };
      },
      getUser: async (): Promise<MockAuthResponse> => {
        return { user: null };
      },
      signOut: async () => {
        return { error: null };
      },
      onAuthStateChange: (callback: Function) => {
        // Mock subscription
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    }
  };
};

// Default client (not actually used in our Replit setup)
export const supabase = createClient('mock', 'mock');

// Export functions that are expected by components but will use our Express API instead
export const refreshSession = async () => {
  // This should use our Express API endpoint
  throw new Error('Use Express API for session refresh');
};
