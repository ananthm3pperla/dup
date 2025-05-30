import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Employee } from '../types';
import { isDemoMode, DEMO_TEAM_MEMBERS } from '../lib/demo';
import ProfileHeader from './profile/ProfileHeader';
import ProfileTabs from './profile/ProfileTabs';
import { TabType } from '../lib/types';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

// Pre-load all tab components
const TAB_COMPONENTS = {
  experience: React.lazy(() => import('./profile/tabs/Experience' /* webpackPrefetch: true */)),
  education: React.lazy(() => import('./profile/tabs/EducationTab' /* webpackPrefetch: true */)),
  team: React.lazy(() => import('./profile/tabs/Team' /* webpackPrefetch: true */)),
  activity: React.lazy(() => import('./profile/tabs/Activity' /* webpackPrefetch: true */))
};

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('experience');

  const handleSave = useCallback((index: number, data: any) => {
    console.log('Saving:', index, data);
  }, []);

  const handleAdd = useCallback(() => {
    console.log('Adding new item');
  }, []);

  const handleDelete = useCallback((index: number) => {
    console.log('Deleting:', index);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      if (id) {
        // Check if we're in demo mode
        if (isDemoMode()) {
          // Find the demo team member
          const demoMember = DEMO_TEAM_MEMBERS.find(m => m.member_id === id);
          if (demoMember) {
            setProfile(demoMember);
          } else {
            setError('Employee not found');
          }
        } else {
          // Regular mode - check localStorage
          const selectedMemberData = localStorage.getItem('selectedMember');
          
          if (selectedMemberData) {
            const memberData = JSON.parse(selectedMemberData);
            // Verify this is the correct member
            if (memberData.member_id === id) {
              setProfile(memberData);
            } else {
              // Try to find in team members
              const storedMembers = localStorage.getItem('mockTeamMembers');
              if (storedMembers) {
                const allMembers = JSON.parse(storedMembers);
                const memberData = allMembers.find((m: any) => m.member_id === id);
                
                if (memberData) {
                  setProfile(memberData);
                  // Store for future reference
                  localStorage.setItem('selectedMember', JSON.stringify(memberData));
                } else {
                  setError('Employee not found');
                }
              } else {
                setError('Employee data not available');
              }
            }
          } else {
            setError('Employee data not available');
          }
        }
      } else {
        // If no ID is provided, use a default profile or redirect
        navigate('/team', { replace: true });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => navigate('/team')} />;
  }

  if (!profile) {
    return <ErrorState message="Profile not found" onRetry={() => navigate('/team')} />;
  }

  const TabComponent = TAB_COMPONENTS[currentTab];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted hover:text-default transition-colors"
        >
          ← Back
        </button>

        {/* Profile Header */}
        <ProfileHeader 
          name={profile.member_name}
          role={profile.member_role}
          department={profile.member_department}
          avatar={profile.member_avatar}
          email={profile.member_email}
          location={profile.member_location}
          phone={profile.member_phone}
          employeeId={profile.member_id}
        />

        {/* Profile Tabs */}
        <ProfileTabs currentTab={currentTab} onTabChange={setCurrentTab} />

        {/* Tab Content */}
        <div className="space-y-6">
          <Suspense fallback={<LoadingState message="Loading tab content..." />}>
            <TabComponent 
              profile={profile}
              onSave={handleSave}
              onAdd={handleAdd}
              onDelete={handleDelete}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}