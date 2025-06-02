
// Local API client for Replit-only deployment
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

// API base URL
const API_BASE = '/api';

// Mock functions that use our Express backend
export const createClient = (url?: string, key?: string) => {
  return {
    auth: {
      signUp: async (credentials: any): Promise<MockAuthResponse> => {
        try {
          const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          return { user: data.user };
        } catch (error) {
          return { user: null, error: error as Error };
        }
      },
      signInWithPassword: async (credentials: any): Promise<MockAuthResponse> => {
        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          return { user: data.user };
        } catch (error) {
          return { user: null, error: error as Error };
        }
      },
      getUser: async (): Promise<MockAuthResponse> => {
        try {
          const response = await fetch(`${API_BASE}/auth/user`);
          const data = await response.json();
          return { user: data.user };
        } catch (error) {
          return { user: null };
        }
      },
      signOut: async () => {
        try {
          await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
          return { error: null };
        } catch (error) {
          return { error: error as Error };
        }
      },
      onAuthStateChange: (callback: Function) => {
        // Mock subscription
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const response = await fetch(`${API_BASE}/${table}?${column}=${value}&select=${columns || '*'}`);
              const data = await response.json();
              return { data: data[0] || null, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
          maybeSingle: async () => {
            try {
              const response = await fetch(`${API_BASE}/${table}?${column}=${value}&select=${columns || '*'}`);
              const data = await response.json();
              return { data: data[0] || null, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
          order: (col: string, options?: any) => ({
            limit: (n: number) => ({
              async then(resolve: any) {
                try {
                  const response = await fetch(`${API_BASE}/${table}?${column}=${value}&select=${columns || '*'}&order=${col}&limit=${n}`);
                  const data = await response.json();
                  resolve({ data, error: null });
                } catch (error) {
                  resolve({ data: null, error });
                }
              }
            })
          })
        }),
        order: (col: string, options?: any) => ({
          async then(resolve: any) {
            try {
              const response = await fetch(`${API_BASE}/${table}?select=${columns || '*'}&order=${col}`);
              const data = await response.json();
              resolve({ data, error: null });
            } catch (error) {
              resolve({ data: null, error });
            }
          }
        }),
        async then(resolve: any) {
          try {
            const response = await fetch(`${API_BASE}/${table}?select=${columns || '*'}`);
            const data = await response.json();
            resolve({ data, error: null });
          } catch (error) {
            resolve({ data: null, error });
          }
        }
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            try {
              const response = await fetch(`${API_BASE}/${table}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              const result = await response.json();
              return { data: result, error: null };
            } catch (error) {
              return { data: null, error };
            }
          }
        }),
        async then(resolve: any) {
          try {
            const response = await fetch(`${API_BASE}/${table}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const result = await response.json();
            resolve({ data: result, error: null });
          } catch (error) {
            resolve({ data: null, error });
          }
        }
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          async then(resolve: any) {
            try {
              const response = await fetch(`${API_BASE}/${table}/${value}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              const result = await response.json();
              resolve({ data: result, error: null });
            } catch (error) {
              resolve({ data: null, error });
            }
          }
        })
      })
    }),
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: Blob, options?: any) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('path', path);
          
          try {
            const response = await fetch(`${API_BASE}/storage/${bucket}/upload`, {
              method: 'POST',
              body: formData
            });
            const result = await response.json();
            return { error: null, data: result };
          } catch (error) {
            return { error, data: null };
          }
        },
        getPublicUrl: (path: string) => ({
          publicUrl: `${API_BASE}/storage/${bucket}/${path}`
        })
      })
    }
  };
};

// Default client
export const supabase = createClient();

// Session management
export const refreshSession = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, session: data.session };
    } else {
      return { success: false, session: null };
    }
  } catch (error) {
    throw new Error('Failed to refresh session');
  }
};

// Helper functions for team management
export const generateInviteLink = async (teamId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE}/teams/${teamId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error);
    
    return data.inviteLink;
  } catch (error) {
    throw new Error(`Error generating invite link: ${error}`);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/user`);
    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
};

export const registerUser = async (userData: any) => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error);
    
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const logout = async () => {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const storeSession = async (session: any) => {
  // Sessions are handled by Express backend
  return true;
};
