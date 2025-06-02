import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  X,
  AlertTriangle,
  Building2,
  Home,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { useRewardsStore } from "@/lib/store/rewardsStore";
import { format, addDays } from "date-fns";
import { toast } from "sonner";

interface UseRemoteDayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export default function UseRemoteDayDialog({
  isOpen,
  onClose,
  currentBalance,
}: UseRemoteDayDialogProps) {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const { requestRemoteDays } = useRewardsStore();

  const [date, setDate] = useState("");
  const [days, setDays] = useState(1);
  const [workType, setWorkType] = useState<"remote" | "flexible">("remote");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !currentTeam?.id || !date) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await requestRemoteDays(user.id, currentTeam.id, date, days);
      toast.success(
        `Successfully scheduled ${days} ${days === 1 ? "day" : "days"} of ${workType} work`,
      );
      onClose();
    } catch (err) {
      console.error("Error using remote days:", err);
      setError("Unable to schedule remote work. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = addDays(new Date(), 1).toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
          <div className="min-h-screen px-4 text-center flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-medium text-gray-900 dark:text-gray-100">
                      Schedule Remote Work
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Available balance: {currentBalance} days
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-error/10 text-error rounded-lg text-xs sm:text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label
                    htmlFor="workType"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Work Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setWorkType("remote")}
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors ${
                        workType === "remote"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-medium text-sm">Remote</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkType("flexible")}
                      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-colors ${
                        workType === "flexible"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="font-medium text-sm">Flexible</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={minDate}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="days"
                    className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Number of Days
                  </label>
                  <select
                    id="days"
                    name="days"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-xs sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => (
                      <option key={value} value={value}>
                        {value} {value === 1 ? "day" : "days"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={
                      isSubmitting ||
                      !date ||
                      days <= 0 ||
                      days > currentBalance
                    }
                    size="sm"
                  >
                    Schedule {workType === "remote" ? "Remote" : "Flexible"}{" "}
                    Work
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
