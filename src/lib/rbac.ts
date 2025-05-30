import { User } from '@supabase/supabase-js';

// Define user roles
export type UserRole = 'admin' | 'manager' | 'member' | 'guest';

// Function to get user roles from user data
export function getUserRoles(user: User | null): UserRole[] {
  if (!user) return ['guest'];

  // Check if user has roles in their metadata
  const roles = user.user_metadata?.roles as UserRole[] | undefined;
  
  if (roles && Array.isArray(roles)) return roles;
  
  // Check if user is a team leader
  if (user.user_metadata?.is_team_leader) {
    return ['manager', 'member'];
  }
  
  // Default role for authenticated users
  return ['member'];
}

// Check if user has specific role
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  const roles = getUserRoles(user);
  return roles.includes(requiredRole);
}

// Check if user has any of the required roles
export function hasAnyRole(user: User | null, requiredRoles: UserRole[]): boolean {
  const roles = getUserRoles(user);
  return requiredRoles.some(role => roles.includes(role));
}