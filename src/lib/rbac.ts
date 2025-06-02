import { User } from './database';

// Define user roles
export type UserRole = 'admin' | 'manager' | 'member' | 'guest';

// Function to get user roles from user data
export function getUserRoles(user: User | null): UserRole[] {
  if (!user) return ['guest'];

  // Map user role to UserRole array
  switch (user.role) {
    case 'hr':
      return ['admin', 'manager', 'member'];
    case 'manager':
      return ['manager', 'member'];
    case 'employee':
      return ['member'];
    default:
      return ['member'];
  }
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