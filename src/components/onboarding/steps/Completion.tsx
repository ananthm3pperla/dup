import React from "react";
import {
  CheckCircle,
  Building2,
  User,
  Calendar,
  Briefcase,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";

interface CompletionProps {
  profile: {
    fullName: string;
    companyName: string;
    jobTitle: string;
    department: string;
    officeLocation: string;
  };
  role: "manager" | "individual_contributor";
  team?: {
    name: string;
    requiredDays: number;
    hasCoreHours: boolean;
    coreHours?: {
      start: string;
      end: string;
    };
  };
  workPreferences: {
    preferredOfficeDays: number;
  };
  onComplete: () => void;
}

export default function Completion({
  profile,
  role,
  team,
  workPreferences,
  onComplete,
}: CompletionProps) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6"
      >
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </motion.div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        You're all set!
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Your account and preferences have been set up. Let's start managing your
        hybrid work schedule.
      </p>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Your information
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {profile.fullName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {profile.companyName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {profile.jobTitle}, {profile.department}
            </span>
          </div>

          {role === "manager" && team && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Team: {team.name} ({team.requiredDays} office days/week)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-success" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Preferred office days: {workPreferences.preferredOfficeDays}/week
            </span>
          </div>
        </div>
      </div>

      <Button onClick={onComplete} className="w-full">
        Go to Dashboard
      </Button>
    </div>
  );
}
