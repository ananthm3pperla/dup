import React from "react";
import { format } from "date-fns";
import { Home, Check, X, Clock, Calendar, AlertTriangle } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

interface RewardRequest {
  id: string;
  date: string;
  days_requested: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason?: string;
  created_at: string;
  requires_high_limit_approval: boolean;
}

interface RewardHistoryCardProps {
  requests: RewardRequest[];
  onCancelRequest?: (id: string) => void;
}

export default function RewardHistoryCard({
  requests,
  onCancelRequest,
}: RewardHistoryCardProps) {
  const getStatusIcon = (
    status: string,
    requiresHighLimitApproval: boolean,
  ) => {
    switch (status) {
      case "approved":
        return (
          <motion.div whileHover={{ scale: 1.2 }}>
            <Check className="h-4 w-4 text-success" />
          </motion.div>
        );
      case "rejected":
        return (
          <motion.div whileHover={{ scale: 1.2 }}>
            <X className="h-4 w-4 text-error" />
          </motion.div>
        );
      case "cancelled":
        return (
          <motion.div whileHover={{ scale: 1.2 }}>
            <X className="h-4 w-4 text-muted" />
          </motion.div>
        );
      default:
        return requiresHighLimitApproval ? (
          <motion.div whileHover={{ scale: 1.2 }}>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Clock className="h-4 w-4 text-warning" />
          </motion.div>
        );
    }
  };

  const getStatusColor = (
    status: string,
    requiresHighLimitApproval: boolean,
  ) => {
    switch (status) {
      case "approved":
        return "bg-success/10 text-success";
      case "rejected":
        return "bg-error/10 text-error";
      case "cancelled":
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
      default:
        return requiresHighLimitApproval
          ? "bg-warning/20 text-warning"
          : "bg-warning/10 text-warning";
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-medium text-default mb-4 sm:mb-6">
        My Recent Requests
      </h3>
      <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto">
        {requests.length > 0 ? (
          <AnimatePresence>
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-card-hover transition-colors"
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-default">
                        {request.days_requested} remote{" "}
                        {request.days_requested === 1 ? "day" : "days"}
                        {request.status === "pending" &&
                          request.requires_high_limit_approval && (
                            <span className="ml-2 text-xs text-warning">
                              (Requires Additional Approval)
                            </span>
                          )}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {format(new Date(request.date), "MMMM d, yyyy")}
                      </p>
                      {request.reason && (
                        <p className="mt-1 text-xs sm:text-sm text-muted">
                          {request.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${getStatusColor(request.status, request.requires_high_limit_approval)}
                      `}
                      >
                        {getStatusIcon(
                          request.status,
                          request.requires_high_limit_approval,
                        )}
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {request.status === "pending" && onCancelRequest && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancelRequest(request.id)}
                      className="mt-2"
                      leftIcon={<X className="h-3 w-3" />}
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              No Recent Requests
            </p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Your remote day requests will appear here
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
