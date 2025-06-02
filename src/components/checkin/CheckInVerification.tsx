import React, { useState, useEffect } from "react";
import { Check, X, MapPin, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { Card, Button } from "@/components/ui";
import { useTeam } from "@/contexts/TeamContext";
import { verifyCheckIn } from "@/lib/checkin";
import { checkinAPI } from "@/lib/api";
import { toast } from "sonner";

interface CheckIn {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
  checkin_time: string;
  photo_url: string;
  location_verified: boolean;
  status: "pending" | "approved" | "rejected";
  ai_analysis?: {
    confidence: number;
    is_person_detected: boolean;
    office_environment: boolean;
    analysis_notes: string;
  };
}

export default function CheckInVerification() {
  const { currentTeam } = useTeam();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  useEffect(() => {
    if (currentTeam) {
      loadCheckins();
    }
  }, [currentTeam, statusFilter]);

  const loadCheckins = async () => {
    if (!currentTeam) return;

    setLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // Last 7 days

      const result = await checkinAPI.getTeamCheckins(
        currentTeam.id,
        startDate.toISOString(),
        today.toISOString(),
        statusFilter === "all" ? undefined : statusFilter,
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      const data = result.data;

      setCheckins(data as any);
    } catch (error) {
      console.error("Error loading check-ins:", error);
      toast.error("Failed to load check-ins");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (
    checkinId: string,
    approved: boolean,
    reason?: string,
  ) => {
    try {
      await verifyCheckIn(checkinId, approved, currentTeam!.created_by, reason);

      setCheckins((prev) =>
        prev.map((checkin) =>
          checkin.id === checkinId
            ? { ...checkin, status: approved ? "approved" : "rejected" }
            : checkin,
        ),
      );

      toast.success(approved ? "Check-in approved" : "Check-in rejected");
    } catch (err) {
      console.error("Error verifying check-in:", err);
      toast.error("Failed to verify check-in");
    }
  };

  const filteredCheckins = checkins.filter((checkin) =>
    checkin.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Check-in Verification
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Status</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse flex items-start gap-4">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCheckins.length > 0 ? (
            filteredCheckins.map((checkin) => (
              <Card key={checkin.id} className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={checkin.user.avatar_url}
                    alt={checkin.user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {checkin.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(
                            new Date(checkin.checkin_time),
                            "MMM d, yyyy h:mm a",
                          )}
                        </p>
                      </div>
                      {checkin.location_verified && (
                        <span className="flex items-center gap-1 text-xs text-success">
                          <MapPin className="h-3.5 w-3.5" />
                          Location Verified
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <img
                        src={checkin.photo_url}
                        alt="Check-in"
                        className="rounded-lg max-h-48 object-cover"
                      />
                      {checkin.ai_analysis && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              AI Analysis
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                checkin.ai_analysis.confidence > 80
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : checkin.ai_analysis.confidence > 60
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              {checkin.ai_analysis.confidence}% confidence
                            </span>
                          </div>
                          <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                            <div>
                              Person detected:{" "}
                              {checkin.ai_analysis.is_person_detected
                                ? "✓"
                                : "✗"}
                            </div>
                            <div>
                              Office environment:{" "}
                              {checkin.ai_analysis.office_environment
                                ? "✓"
                                : "✗"}
                            </div>
                            <div className="italic">
                              {checkin.ai_analysis.analysis_notes}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {checkin.status === "pending" && (
                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-error hover:bg-error/5"
                          leftIcon={<X className="h-4 w-4" />}
                          onClick={() => {
                            const reason = prompt(
                              "Please provide a reason for rejection:",
                            );
                            if (reason) {
                              handleVerify(checkin.id, false, reason);
                            }
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<Check className="h-4 w-4" />}
                          onClick={() => handleVerify(checkin.id, true)}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted">
                No check-ins found matching your criteria
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
