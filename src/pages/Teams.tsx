import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  Plus,
  Copy,
  Check,
  Settings,
  ArrowRight,
  Building2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button, LoadingState, PageHeader } from "@/components/ui";
import { createNewTeam, getUserTeams } from "@/lib/team";
import { toast } from "sonner";
import { isDemoMode } from "@/lib/demo";

export default function Teams() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teams, joinTeam, loading, error: teamError } = useTeam();
  const [joinCode, setJoinCode] = useState("");
  const [copiedTeam, setCopiedTeam] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createTeamName, setCreateTeamName] = useState("");
  const [createTeamDescription, setCreateTeamDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCopyInviteLink = (teamId: string, inviteCode: string) => {
    const inviteLink = `${window.location.origin}/join-team?code=${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedTeam(teamId);
    setShowCopiedTooltip(true);
    toast.success("Invite link copied to clipboard");
    setTimeout(() => {
      setCopiedTeam(null);
      setShowCopiedTooltip(false);
    }, 2000);
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinCode.trim()) {
      setJoinError("Please enter an invite code");
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      await joinTeam(joinCode.trim());
      setJoinCode("");
      toast.success("Successfully joined team!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to join team";
      setJoinError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    setIsCreating(true);

    try {
      const result = await createNewTeam({
        name: createTeamName.trim(),
        description: createTeamDescription.trim() || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        setCreateTeamName("");
        setCreateTeamDescription("");
        setShowCreateForm(false);
        // Refresh teams list
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your teams..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Teams"
        subtitle="Join teams or create your own to start collaborating"
      />

      {teamError && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-error" />
            <p className="text-error font-medium">Error loading teams</p>
          </div>
          <p className="text-error/80 text-sm mt-1">{teamError}</p>
        </div>
      )}

      {/* Join Team Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Join a Team
        </h2>
        <form onSubmit={handleJoinTeam} className="space-y-4">
          <div>
            <label
              htmlFor="joinCode"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Invite Code
            </label>
            <input
              id="joinCode"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder={
                isDemoMode() ? "Try DEMO123" : "Enter team invite code"
              }
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
              disabled={isJoining}
            />
            {joinError && (
              <p className="text-error text-sm mt-1">{joinError}</p>
            )}
          </div>
          <Button
            type="submit"
            isLoading={isJoining}
            disabled={isJoining || !joinCode.trim()}
            leftIcon={<Users className="h-4 w-4" />}
          >
            Join Team
          </Button>
        </form>
      </div>

      {/* Create Team Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create a Team
          </h2>
          {!showCreateForm && (
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create New Team
            </Button>
          )}
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label
                htmlFor="teamName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Team Name *
              </label>
              <input
                id="teamName"
                type="text"
                value={createTeamName}
                onChange={(e) => setCreateTeamName(e.target.value)}
                placeholder="Enter team name"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                disabled={isCreating}
                required
              />
            </div>
            <div>
              <label
                htmlFor="teamDescription"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description (Optional)
              </label>
              <textarea
                id="teamDescription"
                value={createTeamDescription}
                onChange={(e) => setCreateTeamDescription(e.target.value)}
                placeholder="Describe your team"
                rows={3}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                disabled={isCreating}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                isLoading={isCreating}
                disabled={isCreating || !createTeamName.trim()}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create Team
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateTeamName("");
                  setCreateTeamDescription("");
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* My Teams Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My Teams
        </h2>

        {teams && teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {team.name}
                    </h3>
                    {team.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {team.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {team.role || "Member"}
                      </span>
                      {team.member_count && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {team.member_count} member
                          {team.member_count !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {team.invite_code && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyInviteLink(team.id, team.invite_code)
                      }
                      leftIcon={
                        copiedTeam === team.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )
                      }
                      className="relative"
                    >
                      {copiedTeam === team.id ? "Copied!" : "Copy Invite"}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/team/${team.id}/settings`)}
                    leftIcon={<Settings className="h-4 w-4" />}
                  >
                    Settings
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    leftIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View Dashboard
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              No teams yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Join a team using an invite code or create your own team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
