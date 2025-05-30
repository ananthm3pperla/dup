import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectAuthenticated?: boolean;
  redirectPath?: string;
}

export default function AuthRedirect({ 
  children, 
  redirectAuthenticated = true, 
  redirectPath = '/dashboard' 
}: AuthRedirectProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state or use default
  const from = (location.state as any)?.from?.pathname || redirectPath;
  
  useEffect(() => {
    if (!loading) {
      if (redirectAuthenticated && user) {
        // Redirect authenticated users
        navigate(from, { replace: true });
      } else if (!redirectAuthenticated && !user) {
        // Redirect unauthenticated users
        navigate('/login', { 
          replace: true,
          state: { from: location } 
        });
      }
    }
  }, [user, loading, navigate, from, redirectAuthenticated, location]);

  if (loading) {
    return <LoadingState message="Loading..." />;
  }

  // If we want to redirect authenticated users but the user is not authenticated,
  // OR if we want to redirect unauthenticated users but the user is authenticated,
  // then render the children
  if ((redirectAuthenticated && !user) || (!redirectAuthenticated && user)) {
    return <>{children}</>;
  }

  // Otherwise, show a loading state while the redirect happens
  return <LoadingState message="Redirecting..." />;
}