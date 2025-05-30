import { User } from '@supabase/supabase-js';
import { UserRole, getUserRoles } from './rbac';

// Define permission types
export type Permission = 
  // Team permissions
  | 'team:create'
  | 'team:edit'
  | 'team:delete'
  | 'team:invite'
  | 'team:view'
  
  // Schedule permissions
  | 'schedule:create'
  | 'schedule:edit'
  | 'schedule:delete'
  | 'schedule:view'
  | 'schedule:approve'
  
  // User permissions
  | 'user:edit'
  | 'user:view'
  
  // Admin permissions
  | 'admin:access'
  | 'system:settings';

// Define role-to-permission mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // Admin has all permissions
    'team:create', 'team:edit', 'team:delete', 'team:invite', 'team:view',
    'schedule:create', 'schedule:edit', 'schedule:delete', 'schedule:view', 'schedule:approve',
    'user:edit', 'user:view',
    'admin:access', 'system:settings'
  ],
  manager: [
    // Manager has team management and schedule approval
    'team:create', 'team:edit', 'team:invite', 'team:view',
    'schedule:create', 'schedule:edit', 'schedule:view', 'schedule:approve',
    'user:view'
  ],
  member: [
    // Member has basic permissions
    'team:view',
    'schedule:create', 'schedule:edit', 'schedule:view',
    'user:view'
  ],
  guest: [
    // Guest can only view public information
  ]
};

// Check if user has a specific permission
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  
  const roles = getUserRoles(user);
  
  // Check if any of the user's roles grant the requested permission
  return roles.some(role => rolePermissions[role].includes(permission));
}

// Get all permissions for a user
export function getUserPermissions(user: User | null): Permission[] {
  if (!user) return [];
  
  const roles = getUserRoles(user);
  
  // Combine and deduplicate permissions from all roles
  const permissions = roles.flatMap(role => rolePermissions[role]);
  return Array.from(new Set(permissions));
}