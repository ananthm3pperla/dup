import React, { useState } from 'react';
import { Settings, Users, Clock } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { Button, Card } from '@/components/ui';

export default function TeamSettings() {
  const { team, isLeader, updateTeamPolicy } = useTeam();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiredDays, setRequiredDays] = useState(
    team?.rto_policy.required_days || 3
  );
  const [coreHours, setCoreHours] = useState({
    start: team?.rto_policy.core_hours.start || '10:00',
    end: team?.rto_policy.core_hours.end || '16:00'
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      await updateTeamPolicy({
        required_days: requiredDays,
        core_hours: coreHours,
        allowed_work_types: ['office', 'remote', 'flexible']
      });
    } catch (err) {
      console.error('Error updating team policy:', err);
      setError('Failed to update team settings');
    } finally {
      setLoading(false);
    }
  };

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No team selected</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Settings</h1>
        {isLeader && (
          <Button
            onClick={handleSave}
            isLoading={loading}
            disabled={loading}
          >
            Save Changes
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-error/10 text-error text-sm p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <Card.Title>Team Information</Card.Title>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Team Name
                </label>
                <p className="mt-1 text-sm text-gray-900">{team.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Invite Code
                </label>
                <p className="mt-1 text-sm font-mono bg-gray-50 p-2 rounded">
                  {team.invite_code}
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <Card.Title>RTO Policy</Card.Title>
            </div>
            <Card.Description>
              Configure your team's return-to-office requirements
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Required Office Days per Week
                </label>
                <select
                  value={requiredDays}
                  onChange={(e) => setRequiredDays(Number(e.target.value))}
                  disabled={!isLeader}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  {[0, 1, 2, 3, 4, 5].map((days) => (
                    <option key={days} value={days}>
                      {days} {days === 1 ? 'day' : 'days'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Core Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">Start Time</label>
                    <input
                      type="time"
                      value={coreHours.start}
                      onChange={(e) => setCoreHours(h => ({ ...h, start: e.target.value }))}
                      disabled={!isLeader}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">End Time</label>
                    <input
                      type="time"
                      value={coreHours.end}
                      onChange={(e) => setCoreHours(h => ({ ...h, end: e.target.value }))}
                      disabled={!isLeader}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}