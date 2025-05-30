import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from './ui/LoadingState';
import Layout from './layout/Layout';

export default function PrivateRoute() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  // Show loading state while authenticating
  if (authLoading) {
    return <LoadingState message="Authenticating..." />;
  }

  // If user is not authenticated, redirect to landing page
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Render the protected routes within the Layout
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}