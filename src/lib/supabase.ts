
// Stub file - Supabase completely replaced with Replit backend
// This file maintains compatibility while redirecting to proper backend endpoints

export const createClient = () => {
  throw new Error('Supabase is no longer used. Use /api/* endpoints instead.');
};

// Mock auth object for compatibility
export const supabase = {
  auth: {
    signInWithPassword: () => Promise.reject(new Error('Use /api/auth/login')),
    signUp: () => Promise.reject(new Error('Use /api/auth/register')),
    signOut: () => Promise.reject(new Error('Use /api/auth/logout')),
    getUser: () => Promise.reject(new Error('Use /api/auth/me')),
    getSession: () => Promise.reject(new Error('getSession is deprecated')),
    onAuthStateChange: () => {
      console.warn('onAuthStateChange is deprecated');
      return { data: { subscription: { unsubscribe: () => {} }}};
    },
    resetPasswordForEmail: () => Promise.reject(new Error('resetPasswordForEmail is deprecated')),
  },
  from: () => ({
    select: () => Promise.reject(new Error('Direct DB access is not allowed')),
    insert: () => Promise.reject(new Error('Direct DB access is not allowed')),
    update: () => Promise.reject(new Error('Direct DB access is not allowed')),
    delete: () => Promise.reject(new Error('Direct DB access is not allowed')),
    eq: () => Promise.reject(new Error('Direct DB access is not allowed')),
    order: () => Promise.reject(new Error('Direct DB access is not allowed')),
    limit: () => Promise.reject(new Error('Direct DB access is not allowed')),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.reject(new Error('Use /api/upload endpoints')),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    })
  },
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    subscribe: () => {},
    unsubscribe: () => {},
  }),
};

// Legacy function stubs
export const refreshSession = async () => {
  if (typeof window !== 'undefined' && window.location.href.includes('demo=true')) {
    return { 
      success: true, 
      session: {
        user: { id: 'demo', email: 'demo@example.com' },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }
  throw new Error('Session refresh handled by /api/auth/refresh');
};

export const signOut = () => Promise.reject(new Error('Use /api/auth/logout'));

export default supabase;
