import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Frown,
  Meh,
  Smile,
  User,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Clock,
  Check,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { isDemoMode, getConsistentMockData } from "@/lib/demo";

interface TeamMemberPulse {
  id: string;
  name: string;
  avatar: string;
  currentMood: "challenging" | "neutral" | "good";
  lastUpdateTime: string;
  streak: {
    type: "challenging" | "neutral" | "good";
    count: number;
  } | null;
  weekHistory: Array<{
    date: string;
    mood: "challenging" | "neutral" | "good";
  }>;
  requiresAttention: boolean;
  role: string;
  department: string;
}

export default function TeamPulseMonitoring() {
  const { user } = useAuth();
  const { currentTeam, isTeamLeader, teamMembers } = useTeam();
  const [teamPulseData, setTeamPulseData] = useState<TeamMemberPulse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterBy, setFilterBy] = useState<
    "all" | "challenging" | "neutral" | "good"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "status" | "lastUpdate">(
    "status",
  );
  const [selectedMember, setSelectedMember] = useState<TeamMemberPulse | null>(
    null,
  );

  useEffect(() => {
    // Load team pulse data
    const loadTeamPulseData = () => {
      if (!currentTeam || !isTeamLeader) {
        setTeamPulseData([]);
        setIsLoading(false);
        return;
      }

      // Generate mock data for the team members
      const generateMockPulseData = () => {
        if (!teamMembers) return [];

        return teamMembers
          .filter((member) => member.user_id !== user?.id) // Exclude current user
          .map((member) => {
            const moods: Array<"challenging" | "neutral" | "good"> = [
              "challenging",
              "neutral",
              "good",
            ];
            const currentMood = moods[Math.floor(Math.random() * moods.length)];

            // For demo mode, create some members with challenging streaks
            const hasChallengingStreak = isDemoMode() && Math.random() < 0.3;

            let streak = null;
            if (hasChallengingStreak) {
              streak = {
                type: "challenging" as const,
                count: Math.floor(Math.random() * 3) + 2, // 2-4 day streak
              };
            }

            // Create week history
            const today = new Date();
            const weekHistory = Array.from({ length: 5 }, (_, index) => {
              const date = subDays(today, index);
              let mood: "challenging" | "neutral" | "good";

              // For members with challenging streak, show appropriate history
              if (hasChallengingStreak && index < (streak?.count || 0)) {
                mood = "challenging";
              } else {
                // Otherwise random but weighted
                const roll = Math.random();
                if (roll < 0.2) mood = "challenging";
                else if (roll < 0.5) mood = "neutral";
                else mood = "good";
              }

              return {
                date: format(date, "yyyy-MM-dd"),
                mood,
              };
            });

            return {
              id: member.user_id || member.id,
              name:
                member.member_name ||
                `${member.user?.full_name || "Team Member"}`,
              avatar:
                member.member_avatar ||
                member.user?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(member.member_name || "TM")}&background=random`,
              currentMood,
              lastUpdateTime: new Date().toISOString(),
              streak,
              weekHistory,
              requiresAttention: hasChallengingStreak,
              role: member.member_role || "Team Member",
              department: member.member_department || "Engineering",
            };
          });
      };

      // In demo mode, get consistent data
      const mockData = getConsistentMockData(
        "teamPulseData",
        generateMockPulseData,
      );
      setTeamPulseData(mockData);
      setIsLoading(false);
    };

    loadTeamPulseData();
  }, [currentTeam, teamMembers, isTeamLeader, user]);

  // Filter team members based on current filter
  const filteredMembers = teamPulseData.filter(
    (member) => filterBy === "all" || member.currentMood === filterBy,
  );

  // Sort team members based on current sort
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "status") {
      // Sort by requiresAttention first, then by mood severity
      if (a.requiresAttention !== b.requiresAttention) {
        return a.requiresAttention ? -1 : 1;
      }

      const moodOrder = { challenging: 0, neutral: 1, good: 2 };
      return moodOrder[a.currentMood] - moodOrder[b.currentMood];
    } else {
      // lastUpdate
      return (
        new Date(b.lastUpdateTime).getTime() -
        new Date(a.lastUpdateTime).getTime()
      );
    }
  });

  const getMoodIcon = (
    mood: "challenging" | "neutral" | "good",
    size: number = 5,
  ) => {
    switch (mood) {
      case "challenging":
        return <Frown className={`h-${size} w-${size} text-error`} />;
      case "neutral":
        return <Meh className={`h-${size} w-${size} text-warning`} />;
      case "good":
        return <Smile className={`h-${size} w-${size} text-success`} />;
    }
  };

  const handleAction = (
    memberId: string,
    action: "check-in" | "message" | "schedule",
  ) => {
    // In a real app, this would trigger actions like scheduling a meeting, sending a message, etc.
    console.log(`Action: ${action} for member ${memberId}`);
  };

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center dark:bg-primary/20">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              Team Pulse Monitor
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Keep track of your team's wellbeing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="text-xs sm:text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="challenging">Challenging</option>
            <option value="neutral">Neutral</option>
            <option value="good">Good</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs sm:text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="status">Sort by Status</option>
            <option value="name">Sort by Name</option>
            <option value="lastUpdate">Sort by Last Update</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-gray-200 dark:bg-gray-600 h-10 w-10"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedMembers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No team members match the selected filter
          </p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {sortedMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`
                relative rounded-lg border transition-all duration-200 cursor-pointer
                ${
                  member.requiresAttention
                    ? "bg-error/5 dark:bg-error/10 border-error/20"
                    : member.currentMood === "challenging"
                      ? "bg-error/5 dark:bg-error/10"
                      : member.currentMood === "neutral"
                        ? "bg-warning/5 dark:bg-warning/10"
                        : "bg-success/5 dark:bg-success/10"
                }
              `}
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex items-start gap-4 p-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {member.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.role}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1.5">
                          {getMoodIcon(member.currentMood, 4)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {member.currentMood}
                          </span>
                        </div>
                        <span className="text-gray-300 dark:text-gray-600">
                          •
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Updated{" "}
                          {format(new Date(member.lastUpdateTime), "h:mm a")}
                        </span>
                      </div>
                    </div>

                    {member.requiresAttention && (
                      <div className="bg-error/10 text-error text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Needs attention</span>
                      </div>
                    )}
                  </div>

                  {member.streak && member.streak.count > 1 && (
                    <div
                      className={`mt-2 text-xs rounded-md px-2.5 py-1.5 inline-flex items-center gap-1.5
                      ${
                        member.streak.type === "challenging"
                          ? "bg-error/10 text-error"
                          : member.streak.type === "neutral"
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success"
                      }
                    `}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {member.streak.count} day
                        {member.streak.count !== 1 ? "s" : ""}{" "}
                        {member.streak.type} streak
                      </span>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Weekly Status
                      </h5>
                    </div>
                    <div className="flex gap-1">
                      {member.weekHistory.map((day, index) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded-md flex items-center justify-center 
                            ${
                              day.mood === "challenging"
                                ? "bg-error/20"
                                : day.mood === "neutral"
                                  ? "bg-warning/20"
                                  : "bg-success/20"
                            }
                          `}
                          title={`${format(new Date(day.date), "EEE, MMM d")}: ${day.mood}`}
                        >
                          {day.mood === "challenging"
                            ? "😞"
                            : day.mood === "neutral"
                              ? "😐"
                              : "😊"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {sortedMembers.filter((m) => m.requiresAttention).length} team
            members need attention
          </div>
          <button className="text-primary text-sm font-medium hover:text-primary-dark dark:hover:text-primary-light transition-colors">
            View detailed report
          </button>
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      {selectedMember.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedMember.role} • {selectedMember.department}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5">
                        {getMoodIcon(selectedMember.currentMood, 4)}
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          Current mood: {selectedMember.currentMood}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {/* Mood History */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Mood History
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="space-y-4">
                      {selectedMember.weekHistory.map((day, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {format(new Date(day.date), "EEE, MMM d")}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`
                              px-2 py-1 rounded-full text-xs
                              ${
                                day.mood === "challenging"
                                  ? "bg-error/10 text-error"
                                  : day.mood === "neutral"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-success/10 text-success"
                              }
                            `}
                            >
                              {getMoodIcon(day.mood, 3)}
                              <span className="ml-1 capitalize">
                                {day.mood}
                              </span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Recommended Actions
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={() =>
                        handleAction(selectedMember.id, "check-in")
                      }
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-dark"
                    >
                      <Check className="h-4 w-4" />
                      Schedule a check-in conversation
                    </button>
                    <button
                      onClick={() => handleAction(selectedMember.id, "message")}
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Send a direct message
                    </button>
                    <button
                      onClick={() =>
                        handleAction(selectedMember.id, "schedule")
                      }
                      className="w-full flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Clock className="h-4 w-4" />
                      Review work schedule
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Add Notes
                  </h4>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
                    rows={3}
                    placeholder="Add private notes about this team member's wellbeing..."
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-dark">
                  Save Notes
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
