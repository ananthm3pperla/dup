import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, hasAnyRole } from '@/lib/rbac';
import { LoadingState } from '@/components/ui';
import Layout from '@/components/layout/Layout';

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  redirectPath?: string;
}

export default function RoleProtectedRoute({ 
  allowedRoles, 
  redirectPath = '/'
}: RoleProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while authenticating
  if (loading) {
    return <LoadingState message="Authenticating..." />;
  }

  // Check if the user has any of the required roles
  if (!user || !hasAnyRole(user, allowedRoles)) {
    // If not, redirect to the specified path
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If authorized, render the child routes within the layout
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}