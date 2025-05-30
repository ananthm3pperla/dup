import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import LoadingState from '@/components/ui/LoadingState';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { teams, loading: teamLoading } = useTeam();

  useEffect(() => {
    // Wait for both auth and team loading to complete
    if (!authLoading && !teamLoading) {
      if (user) {
        // Check if user has any teams
        if (teams.length === 0) {
          // New user, redirect to onboarding
          navigate('/onboarding');
        } else {
          // Returning user, redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        // If no user, redirect to login
        navigate('/login');
      }
    }
  }, [user, authLoading, teams, teamLoading, navigate]);

  return <LoadingState message="Completing sign in..." />;
}