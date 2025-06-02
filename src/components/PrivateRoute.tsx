
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface PrivateRouteProps {
  children: ReactNode;
  requireRole?: string[];
}

export default function PrivateRoute({ children, requireRole }: PrivateRouteProps) {
  const { user, loading, error, isAuthenticated, clearError } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingState message="Checking authentication..." />
      </div>
    );
  }

  // Show error state if there's an auth error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button
                onClick={clearError}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/login'}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requireRole && user) {
    const userRole = user.role?.toLowerCase();
    const hasRequiredRole = requireRole.some(role => 
      role.toLowerCase() === userRole
    );

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Access Restricted
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don't have permission to access this page. Required role: {requireRole.join(' or ')}.
              </p>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
