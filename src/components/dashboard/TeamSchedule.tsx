import React, { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  ChevronRight,
  Building2,
  Home,
  Clock,
} from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { getConsistentMockData } from "@/lib/demo";
import { motion } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  schedule: {
    [key: string]: "office" | "remote" | "flexible";
  };
  votedDays?: string[];
}

export default function TeamSchedule() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [currentWeekDays] = useState(() =>
    Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i)),
  );

  useEffect(() => {
    // Generate mock team data with consistent values
    const generateTeamData = () => {
      return Array.from({ length: 4 }, (_, i) => ({
        id: `team-member-${i}`,
        name: ["Sarah Chen", "Raj Patel", "Emily Johnson", "Michael Zhang"][i],
        role: [
          "Senior Software Engineer",
          "Product Manager",
          "UX Designer",
          "Engineering Manager",
        ][i],
        avatar: [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80",
        ][i],
        schedule: currentWeekDays.reduce(
          (acc, day) => {
            // Make Tuesday(1) and Thursday(3) office days for most people
            const dayIdx = day.getDay() - 1; // 0=Mon, 1=Tue, etc.
            let workType: "office" | "remote" | "flexible" = "remote";

            if (dayIdx === 1 || dayIdx === 3) {
              // Anchor days - Tuesday and Thursday
              workType = "office";
            } else if (i === 0 && dayIdx === 0) {
              // First person also goes to office on Mondays
              workType = "office";
            } else if (i === 1 && dayIdx === 2) {
              // Second person goes to office on Wednesdays too
              workType = "office";
            }

            acc[format(day, "yyyy-MM-dd")] = workType;
            return acc;
          },
          {} as { [key: string]: "office" | "remote" | "flexible" },
        ),
        votedDays:
          i % 2 === 0
            ? [
                format(addDays(currentWeekStart, 1), "yyyy-MM-dd"),
                format(addDays(currentWeekStart, 3), "yyyy-MM-dd"),
              ]
            : [
                format(addDays(currentWeekStart, 0), "yyyy-MM-dd"),
                format(addDays(currentWeekStart, 2), "yyyy-MM-dd"),
              ],
      }));
    };

    const teamData = getConsistentMockData(
      "teamScheduleMembers",
      generateTeamData,
    );
    setTeamMembers(teamData);
    setIsLoading(false);
  }, [currentWeekStart, currentWeekDays]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="animate-pulse flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center dark:bg-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              My Team's Schedule
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Who's in the office this week
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Week of</span>{" "}
          {format(currentWeekStart, "MMM d, yyyy")}
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {teamMembers.map((member) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-lg bg-white border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-primary/40"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-colors"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.role}
                    </p>
                  </div>
                  {member.votedDays && member.votedDays.length > 0 && (
                    <div className="flex items-center gap-2 text-xs animate-fadeIn">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Next Week:</span>
                        <span className="hidden sm:inline">
                          {member.votedDays
                            .map((date) => format(new Date(date), "EEE"))
                            .join(", ")}
                        </span>
                        <span className="sm:hidden">
                          {member.votedDays.length} day
                          {member.votedDays.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-5 gap-1 sm:gap-2">
                  {currentWeekDays.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const workType = member.schedule[dateStr] || "flexible";

                    const getWorkTypeIcon = (type: string) => {
                      switch (type) {
                        case "office":
                          return (
                            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          );
                        case "remote":
                          return <Home className="h-3 w-3 sm:h-4 sm:w-4" />;
                        default:
                          return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />;
                      }
                    };

                    const getWorkTypeStyles = (type: string) => {
                      switch (type) {
                        case "office":
                          return "bg-primary/10 text-primary border-primary/20";
                        case "remote":
                          return "bg-success/10 text-success border-success/20";
                        default:
                          return "bg-warning/10 text-warning border-warning/20";
                      }
                    };

                    // Check if anchor day (Tuesday or Thursday)
                    const isAnchorDay =
                      day.getDay() === 2 || day.getDay() === 4;

                    return (
                      <div
                        key={day.toString()}
                        className={`
                          relative px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium border
                          border flex items-center justify-center gap-1 sm:gap-2 transition-all duration-200
                          ${getWorkTypeStyles(workType)} ${isAnchorDay ? "ring-1 ring-primary/50" : ""}
                        `}
                      >
                        {getWorkTypeIcon(workType)}
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-normal">
                            {format(day, "EEE")}
                          </span>
                          <span className="capitalize text-xs hidden sm:inline">
                            {workType}
                          </span>
                          {isAnchorDay && (
                            <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-white text-[8px] flex items-center justify-center rounded-full">
                              A
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:block" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
