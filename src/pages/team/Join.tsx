import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, AlertCircle, Check } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";

export default function TeamJoin() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { joinTeam, loading, error } = useTeam();
  const { user } = useAuth();

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setJoinError("No invite link provided");
        setIsValidating(false);
        return;
      }

      try {
        // In a real app, we would validate the token with the server
        // For demo purposes, we'll just assume it's valid
        const isValid = true;
        setIsValid(isValid);

        if (isValid) {
          // Get team details
          const team = await joinTeam(token);
          setTeamName(team.name);
        } else {
          setJoinError("This invite link has expired");
        }
      } catch (err) {
        console.error("Error validating invite:", err);
        setJoinError("Invalid invite link");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleJoin = async () => {
    if (!token || !isValid) return;

    try {
      await joinTeam(token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error joining team:", err);
      setJoinError(err instanceof Error ? err.message : "Failed to join team");
    }
  };

  if (isValidating) {
    return <LoadingState message="Validating invite link..." />;
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Join Team</h1>
        <p className="mt-2 text-gray-600">
          {isValid
            ? "You've been invited to join a team on Hi-Bridge"
            : "This invite link is no longer valid"}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {(joinError || error) && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {joinError || error}
                </h3>
              </div>
            </div>
          </div>
        )}

        {isValid && teamName ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">{teamName}</h2>
              <p className="text-sm text-gray-600 mt-1">
                You've been invited to join this team
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Ready to join
                  </h3>
                  <p className="text-xs text-gray-600">
                    You'll be joining as {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button variant="outline" onClick={() => navigate("/teams")}>
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                isLoading={loading}
                disabled={loading}
              >
                Join Team
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-red-50 rounded-lg p-6 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Invalid Invite Link
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                This invite link is either invalid or has expired. Please
                request a new invite link from your team leader.
              </p>
            </div>
            <Button onClick={() => navigate("/teams")} variant="outline">
              Return to Teams
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
