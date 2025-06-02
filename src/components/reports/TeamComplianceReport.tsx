import React, { useEffect, useState } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { format, startOfWeek, subWeeks, addDays } from "date-fns";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  DownloadIcon,
} from "lucide-react";
import { Card, Button } from "@/components/ui";

interface ComplianceData {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  required_days: number;
  office_days: number;
  total_days: number;
  compliance_rate: number;
}

export default function TeamComplianceReport() {
  const { teamMembers, currentTeam } = useTeam();
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [showChart, setShowChart] = useState(false);

  // Calculate overall compliance
  const overallCompliance = complianceData.length
    ? complianceData.reduce((sum, item) => sum + item.compliance_rate, 0) /
      complianceData.length
    : 0;

  // Count team members meeting requirements
  const meetingRequirements = complianceData.filter(
    (item) => item.compliance_rate >= 1,
  ).length;

  useEffect(() => {
    const generateComplianceData = () => {
      if (!teamMembers || !currentTeam) return [];

      // Get required days from team policy
      const requiredDays = currentTeam.rto_policy.required_days || 3;

      // Generate mock compliance data for each team member
      return teamMembers.map((member) => {
        // Generate a realistic but random number of office days
        const officeDays = Math.floor(Math.random() * (requiredDays + 2));
        const totalDays = 5; // Typical workweek

        // Calculate compliance rate (capped at 100%)
        const complianceRate = Math.min(officeDays / requiredDays, 1);

        return {
          user_id: member.user_id || member.id,
          user_name:
            member.member_name || member.user?.full_name || "Team Member",
          user_avatar: member.member_avatar || member.user?.avatar_url,
          required_days: requiredDays,
          office_days: officeDays,
          total_days: totalDays,
          compliance_rate: complianceRate,
        };
      });
    };

    const loadData = async () => {
      try {
        setLoading(true);

        // In a real implementation, this would fetch data from an API
        const data = generateComplianceData();
        setComplianceData(data);
      } catch (err) {
        console.error("Error loading compliance data:", err);
        setError("Failed to load compliance data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teamMembers, currentTeam]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    const nextWeek = subWeeks(currentWeekStart, -1);
    if (nextWeek <= startOfWeek(new Date(), { weekStartsOn: 1 })) {
      setCurrentWeekStart(nextWeek);
    }
  };

  const handleExportData = () => {
    // In a real implementation, this would generate a CSV or Excel file
    alert("Data exported successfully");
  };

  const getStatusColor = (compliance: number) => {
    if (compliance >= 1) return "text-success bg-success/10";
    if (compliance >= 0.8) return "text-warning bg-warning/10";
    return "text-error bg-error/10";
  };

  const getStatusMessage = (compliance: number) => {
    if (compliance >= 1) return "Compliant";
    if (compliance >= 0.8) return "Partially Compliant";
    return "Non-Compliant";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Team RTO Compliance
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tracking office attendance against policy requirements
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportData}
            leftIcon={<DownloadIcon className="h-4 w-4" />}
            className="hidden md:flex"
          >
            Export
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowChart(!showChart)}
            leftIcon={
              showChart ? (
                <Calendar className="h-4 w-4" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )
            }
          >
            {showChart ? "Table View" : "Chart View"}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePreviousWeek}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>

        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Week of {format(currentWeekStart, "MMM d, yyyy")}
        </h4>

        <Button
          size="sm"
          variant="outline"
          onClick={handleNextWeek}
          rightIcon={<ChevronRight className="h-4 w-4" />}
          disabled={
            currentWeekStart >= startOfWeek(new Date(), { weekStartsOn: 1 })
          }
        >
          Next
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card-hover p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Overall Compliance
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              {(overallCompliance * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              team average
            </span>
          </div>
        </div>

        <div className="bg-card-hover p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Meeting Requirements
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              {meetingRequirements}/{complianceData.length}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              team members
            </span>
          </div>
        </div>

        <div className="bg-card-hover p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Required Office Days
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              {currentTeam?.rto_policy.required_days || 3}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              per week
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-12 bg-gray-100 dark:bg-gray-800 rounded"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 text-error bg-error/10 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {showChart ? (
            <div className="h-80 mt-6">
              <div className="flex h-full items-end gap-2">
                {complianceData.map((item) => (
                  <div
                    key={item.user_id}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-primary/20 rounded-t"
                      style={{
                        height: `${item.compliance_rate * 100}%`,
                        minHeight: "10%",
                      }}
                    ></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
                      {item.user_name.split(" ")[0]}
                    </span>
                    <span className="text-xs font-medium">
                      {item.office_days}/{item.required_days}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Team Member</th>
                    <th className="px-4 py-3">Office Days</th>
                    <th className="px-4 py-3">Compliance</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {complianceData.map((item) => (
                    <tr key={item.user_id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {item.user_avatar ? (
                              <img
                                src={item.user_avatar}
                                alt={item.user_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                  {item.user_name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.user_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.office_days}/{item.required_days}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${Math.min(item.compliance_rate * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-block">
                          {(item.compliance_rate * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.compliance_rate)}`}
                        >
                          {item.compliance_rate >= 1 && (
                            <Check className="h-3 w-3" />
                          )}
                          {getStatusMessage(item.compliance_rate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
