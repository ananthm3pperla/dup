import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Settings, UserPlus } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { Button, Card } from '@/components/ui';

export default function MyTeams() {
  const { team, isLeader } = useTeam();
  const navigate = useNavigate();

  if (!team) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
        <div className="bg-primary/10 p-4 rounded-full mb-6">
          <Users className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-default mb-4">
          Join or Create a Team
        </h1>
        <p className="text-muted max-w-md mb-8">
          Get started by creating your own team or joining an existing one with an invite code.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/team/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
          <Button
            onClick={() => navigate('/team/join')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Join Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-default">My Teams</h1>
        {isLeader && (
          <Button
            onClick={() => navigate('/team/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="relative group hover:shadow-lg transition-all duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-default">{team.name}</h3>
              {isLeader && (
                <button
                  onClick={() => navigate('/team/settings')}
                  className="p-2 text-muted hover:text-default hover:bg-card-hover rounded-md opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted" />
                <span className="text-muted">
                  {isLeader ? 'Team Leader' : 'Team Member'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <img
                      key={i}
                      src={`https://images.unsplash.com/photo-${1500 + i}?w=32&h=32&q=80`}
                      alt=""
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted">+2 others</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-default">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Invite Code</span>
                <code className="px-2 py-1 bg-card-hover rounded text-xs font-mono">
                  {team.invite_code}
                </code>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}