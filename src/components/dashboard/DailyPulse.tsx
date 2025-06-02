import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Frown,
  Meh,
  Smile,
  Check,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { usePulseStore, type Mood } from "@/lib/store/pulseStore";
import { useTeam } from "@/contexts/TeamContext";
import { isDemoMode } from "@/lib/demo";
import DailyPulseSettings from "./DailyPulseSettings";

interface MoodOption {
  value: Mood;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export default function DailyPulse() {
  const { isTeamLeader } = useTeam();
  const {
    addPulse,
    getLatestPulse,
    shouldNotifyManager,
    getConsecutiveChallengingDays,
    getWeeklyChallenging,
    notificationPreferences,
    initialize,
  } = usePulseStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const latestPulse = getLatestPulse();
  const shouldNotify = shouldNotifyManager();

  // Initialize in demo mode
  useEffect(() => {
    if (isDemoMode()) {
      initialize();
    }
  }, [initialize]);

  const moodOptions: MoodOption[] = [
    {
      value: "challenging",
      label: "Challenging",
      description: "Feeling overwhelmed or stressed",
      icon: Frown,
      color: "#EF4444",
      bgColor: "#FEE2E2",
    },
    {
      value: "neutral",
      label: "Neutral",
      description: "Getting through the day",
      icon: Meh,
      color: "#F59E0B",
      bgColor: "#FEF3C7",
    },
    {
      value: "good",
      label: "Good",
      description: "Feeling positive and productive",
      icon: Smile,
      color: "#10B981",
      bgColor: "#D1FAE5",
    },
  ];

  const handleMoodSelect = (mood: Mood) => {
    const submission = {
      mood,
      timestamp: new Date().toISOString(),
    };

    addPulse(submission);
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border dark:border-gray-700 p-4 sm:p-6 daily-pulse"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center dark:bg-primary/20">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              My Daily Pulse
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              How are you feeling today?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {latestPulse && (
            <span className="text-xs sm:text-sm text-muted dark:text-gray-400 hidden sm:inline">
              Last updated: {format(new Date(latestPulse.timestamp), "h:mm a")}
            </span>
          )}
          {isTeamLeader && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {shouldNotify && isTeamLeader && (
        <motion.div
          className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-warning/5 border border-warning/10 dark:bg-warning/10 dark:border-warning/20"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-warning/20 dark:bg-warning/30 flex-shrink-0">
              <Frown className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-warning dark:text-warning-light">
                Team Member Alert
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {getConsecutiveChallengingDays() >=
                  notificationPreferences.consecutiveChallenging && (
                  <span>
                    A team member has reported {getConsecutiveChallengingDays()}{" "}
                    consecutive challenging days.{" "}
                  </span>
                )}
                {getWeeklyChallenging() >=
                  notificationPreferences.challengingPerWeek && (
                  <span>
                    A team member has reported {getWeeklyChallenging()}{" "}
                    challenging days this week.{" "}
                  </span>
                )}
                Consider checking in with them.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <h4 className="text-lg sm:text-xl font-medium text-gray-900 mb-4 sm:mb-6">
        <span className="dark:text-white">
          {latestPulse ? "Today's Selection" : "How are you feeling today?"}
        </span>
      </h4>

      <AnimatePresence mode="wait">
        <div className="space-y-3">
          {latestPulse ? (
            moodOptions
              .filter((option) => option.value === latestPulse.mood)
              .map((option) => {
                const Icon = option.icon;
                return (
                  <motion.div
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full p-3 sm:p-4 rounded-lg border transition-all duration-200 flex items-center gap-3 sm:gap-4"
                    style={{
                      borderColor: option.color,
                      backgroundColor: option.bgColor,
                      boxShadow: `0 0 0 2px ${option.color}20`,
                    }}
                  >
                    <div
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: option.bgColor,
                        color: option.color,
                      }}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h5 className="font-medium text-default dark:text-white text-sm sm:text-base">
                        {option.label}
                      </h5>
                      <p className="text-xs sm:text-sm text-muted dark:text-gray-400 truncate">
                        {option.description}
                      </p>

                      {latestPulse.notes && (
                        <p className="mt-1 text-xs sm:text-sm italic text-gray-600 dark:text-gray-300">
                          "{latestPulse.notes}"
                        </p>
                      )}
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 500,
                      }}
                    >
                      <Check className="h-5 w-5 text-success" />
                    </motion.div>
                  </motion.div>
                );
              })
          ) : (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {moodOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.1 },
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                    onClick={() => handleMoodSelect(option.value)}
                    className="w-full p-3 sm:p-4 rounded-lg border transition-all duration-200 flex items-center gap-3 sm:gap-4 border-default hover:border-primary/50 hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    aria-label={`Select mood: ${option.label}`}
                  >
                    <div
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                      style={{
                        backgroundColor: "#F3F4F6",
                        color: option.color,
                      }}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h5 className="font-medium text-default dark:text-white text-sm sm:text-base">
                        {option.label}
                      </h5>
                      <p className="text-xs sm:text-sm text-muted dark:text-gray-400 truncate">
                        {option.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </AnimatePresence>

      {isTeamLeader && (
        <DailyPulseSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </motion.div>
  );
}
