
/**
 * Compatibility layer for Supabase migration
 * This file provides stub implementations for functions that were previously from Supabase
 */

import { refreshSession as authRefreshSession } from './auth';

// Re-export auth functions for compatibility
export { refreshSession } from './auth';

// Stub implementation for any remaining Supabase references
export const supabase = {
  auth: {
    refreshSession: authRefreshSession
  }
};

// Default export for compatibility
export default supabase;
