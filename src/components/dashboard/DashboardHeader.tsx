import React, { useState, useEffect } from "react";
import { Calendar, Users, Building2, Home, Trophy, Target } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { CheckInButton } from "../checkin";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { isDemoMode, getDemoUser, getConsistentMockData, DEMO_USER } from "@/lib/demo";

interface DashboardHeaderProps {
  firstName: string;
}

export default function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const [weeklyProgress] = useState(() => {
    const generateWeeklyData = () => {
      return { completed: 2, required: 3 };
    };

    return getConsistentMockData("weeklyProgress", generateWeeklyData);
  });

  // Use the demo user's first name if in demo mode
  const displayName = isDemoMode()
    ? DEMO_USER.full_name.split(" ")[0]
    : firstName;

  return (
    <div className="mb-6 dashboard-header">
      <motion.div
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {displayName}! 👋
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </motion.div>
        <motion.div
          className="flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <CheckInButton className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 text-sm font-medium rounded-full bg-primary hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md" />
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 text-sm font-medium rounded-full bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Schedule</span> Office Day
          </Link>
        </motion.div>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <motion.div
          className="bg-white rounded-lg p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{
            y: -5,
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center dark:bg-primary/20">
              <Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                My Office Days
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {weeklyProgress.completed}/
                {isDemoMode() ? 3 : weeklyProgress.required}
              </p>
              <p className="text-xs text-success mt-1">On Track</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="bg-white rounded-lg p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{
            y: -5,
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-success/10 flex items-center justify-center dark:bg-success/20">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-success" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Team In Office
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                85%
              </p>
              <p className="text-xs text-success mt-1">+12% this week</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="bg-white rounded-lg p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{
            y: -5,
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-warning/10 flex items-center justify-center dark:bg-warning/20">
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-warning" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                My Remote Days
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                4.5
              </p>
              <p className="text-xs text-warning mt-1">Available to use</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="bg-white rounded-lg p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{
            y: -5,
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-info/10 flex items-center justify-center dark:bg-info/20">
              <Target className="h-5 w-5 md:h-6 md:w-6 text-info" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                My Engagement
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                4.8
              </p>
              <p className="text-xs text-info mt-1">+0.3 this month</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}