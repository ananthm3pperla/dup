
// Stub file - Supabase replaced with Replit backend
export const createClient = () => {
  throw new Error('Supabase is no longer used. Use /api/auth endpoints instead.');
};

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
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    subscribe: () => {},
    unsubscribe: () => {},
  }),
};

// Legacy exports for compatibility
export const refreshSession = () => Promise.reject(new Error('Session refresh handled by backend'));

export default supabase;
