import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Plus, Copy, Check, Settings, ArrowRight, Building2, Clock, AlertCircle } from 'lucide-react';
import { Button, LoadingState, PageHeader } from '@/components/ui';
import { generateInviteLink } from '@/lib/supabase';

export default function Teams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teams, joinTeam, loading, error: teamError } = useTeam();
  const [joinCode, setJoinCode] = useState('');
  const [copiedTeam, setCopiedTeam] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const handleCopyInviteLink = (teamId: string) => {
    const inviteLink = generateInviteLink(teamId);
    navigator.clipboard.writeText(inviteLink);
    setCopiedTeam(teamId);
    setShowCopiedTooltip(true);
    setTimeout(() => {
      setCopiedTeam(null);
      setShowCopiedTooltip(false);
    }, 2000);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    setJoinError(null);
    
    try {
      await joinTeam(joinCode.trim());
      setJoinCode('');
    } catch (err) {
      console.error('Error joining team:', err);
      setJoinError(err instanceof Error ? err.message : 'Failed to join team. Please check the invite code.');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading teams..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader 
        title="My Teams"
        description="Manage your teams or join existing ones"
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/team/create')}
              leftIcon={<Plus className="h-4 w-4" />}
              className="bg-primary hover:bg-primary-light"
            >
              Create Team
            </Button>
            <Button
              onClick={() => navigate('/join-team')}
              variant="outline"
              className="bg-white hover:bg-gray-50"
              leftIcon={<ArrowRight className="h-4 w-4" />}
            >
              Join Team
            </Button>
          </div>
        }
      />

      {/* Join Team Section */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl p-6 shadow-sm">
        <div className="max-w-2xl">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Join a Team</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Have an invite link? Enter it below to join your team.
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  setJoinError(null);
                }}
                placeholder="Paste invite link here"
                className={`block w-full rounded-lg border ${
                  joinError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
                  'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
                } bg-white dark:bg-gray-800 px-4 py-2.5 shadow-sm focus:outline-none sm:text-sm`}
              />
              {joinError && (
                <p className="absolute left-0 top-full mt-1 text-xs text-red-600 dark:text-red-400">
                  {joinError}
                </p>
              )}
            </div>
            <Button
              onClick={handleJoin}
              disabled={!joinCode.trim() || isJoining}
              isLoading={isJoining}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="whitespace-nowrap"
            >
              Join Team
            </Button>
          </div>
        </div>
      </div>
      
      {teams.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Teams Yet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Create your first team or join an existing one using an invite link to start managing hybrid work schedules.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate('/team/create')}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create New Team
            </Button>
            <Button
              onClick={() => navigate('/join-team')}
              variant="outline"
              leftIcon={<ArrowRight className="h-4 w-4" />}
            >
              Join with Invite
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Teams</h2>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {teams.map((team) => (
              <li key={team.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="text-xl font-medium text-primary">{team.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{team.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          {team.created_by === user?.id ? 'Team Leader' : 'Team Member'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4" />
                          {team.rto_policy.required_days} days/week in office
                        </span>
                        {team.rto_policy.core_hours && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            Core hours: {team.rto_policy.core_hours.start} - {team.rto_policy.core_hours.end}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleCopyInviteLink(team.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        copiedTeam === team.id 
                          ? 'bg-success/10 text-success' 
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {copiedTeam === team.id ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Invite Link
                        </>
                      )}
                    </button>
                    
                    {team.created_by === user?.id && (
                      <Button
                        size="sm"
                        onClick={() => navigate('/team/settings')}
                        leftIcon={<Settings className="h-4 w-4" />}
                        variant="outline"
                      >
                        Settings
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}