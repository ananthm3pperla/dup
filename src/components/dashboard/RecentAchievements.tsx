import React, { useEffect, useState } from "react";
import { Trophy, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { generateMockAchievements } from "../../lib/mockData";
import { companySettings } from "../../data/company";

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  points: number;
  type: "attendance" | "collaboration" | "engagement";
}

export default function RecentAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate mock achievements using the existing function
    const mockAchievements = generateMockAchievements(3);
    setAchievements(mockAchievements);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg shadow-md">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-card-hover rounded w-1/4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-card-hover rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border dark:border-gray-700 p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
            My Recent Achievements
          </h3>
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {achievements.length > 0 ? (
          achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-card-hover dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor:
                    achievement.type === "attendance"
                      ? `${companySettings.branding.primaryColor}15`
                      : achievement.type === "collaboration"
                        ? `${companySettings.branding.secondaryColor}15`
                        : `${companySettings.branding.accentColor}15`,
                }}
              >
                <Trophy
                  className="h-4 w-4 sm:h-5 sm:w-5 dark:text-white"
                  style={{
                    color:
                      achievement.type === "attendance"
                        ? companySettings.branding.primaryColor
                        : achievement.type === "collaboration"
                          ? companySettings.branding.secondaryColor
                          : companySettings.branding.accentColor,
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-default dark:text-white">
                  {achievement.title}
                </h4>
                <p className="mt-1 text-xs text-muted dark:text-gray-400 line-clamp-2">
                  {achievement.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted dark:text-gray-400">
                    {format(new Date(achievement.date), "MMM d")}
                  </span>
                  <motion.span
                    className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success"
                    whileHover={{ scale: 1.1 }}
                  >
                    +{achievement.points} pts
                  </motion.span>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0 }}
                whileHover={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:block"
              >
                <ChevronRight className="h-5 w-5 text-muted dark:text-gray-400" />
              </motion.div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="text-center py-6 sm:py-8 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs sm:text-sm text-muted dark:text-gray-400">
              No recent achievements
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
