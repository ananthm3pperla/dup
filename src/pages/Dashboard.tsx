import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { pulseAPI, checkinAPI, analyticsAPI } from "@/lib/api";
import {
  Building,
  Calendar,
  Camera,
  Heart,
  Trophy,
  Users,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

interface PulseCheck {
  id: string;
  rating: number;
  comment?: string;
  date: string;
}

interface CheckIn {
  id: string;
  location: string;
  timestamp: string;
  points: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [todaysPulse, setTodaysPulse] = useState<PulseCheck | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([]);
  const [teamStats, setTeamStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for AI features
  const mockPulseData = [
    {
      rating: 4,
      comment: "Great team collaboration today",
      date: "2024-01-15",
      userId: "1",
    },
    {
      rating: 3,
      comment: "Feeling a bit overwhelmed with deadlines",
      date: "2024-01-14",
      userId: "2",
    },
    {
      rating: 5,
      comment: "Love working from the office on Tuesdays",
      date: "2024-01-13",
      userId: "3",
    },
    {
      rating: 2,
      comment: "Having connectivity issues while remote",
      date: "2024-01-12",
      userId: "4",
    },
  ];

  const mockTeamData = {
    memberCount: 8,
    hybridPolicy: "3 days office, 2 days remote",
  };

  const mockTeamSchedule = {
    officeSchedule: {
      "2024-01-15": ["user1", "user2", "user3"],
      "2024-01-16": ["user1", "user4", "user5"],
    },
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load today's pulse check
      const pulseResponse = await pulseAPI.getTodaysPulse();
      setTodaysPulse(pulseResponse.pulseCheck);

      // Load team analytics if user is manager/hr
      if (user?.role === "manager" || user?.role === "hr") {
        const analyticsResponse = await analyticsAPI.getTeamAnalytics();
        setTeamStats(analyticsResponse.analytics);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitPulse = async (rating: number, comment?: string) => {
    try {
      const response = await pulseAPI.submitPulse({ rating, comment });
      setTodaysPulse(response.pulseCheck);
    } catch (error) {
      console.error("Failed to submit pulse:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.fullName?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Let's make today productive and engaging for your team.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="office-days-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Office Days This Week
              </p>
              <p className="text-3xl font-bold text-primary">3</p>
            </div>
            <Building className="h-12 w-12 text-primary opacity-20" />
          </div>
          <div className="mt-4">
            <Badge variant="success" size="sm">
              +2 from last week
            </Badge>
          </div>
        </Card>

        <Card className="remote-days-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Remote Days Available
              </p>
              <p className="text-3xl font-bold text-success">2</p>
            </div>
            <Calendar className="h-12 w-12 text-success opacity-20" />
          </div>
          <div className="mt-4">
            <Badge variant="info" size="sm">
              Earned by office visits
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Team Engagement
              </p>
              <p className="text-3xl font-bold text-accent">92%</p>
            </div>
            <TrendingUp className="h-12 w-12 text-accent opacity-20" />
          </div>
          <div className="mt-4">
            <Badge variant="success" size="sm">
              Above target
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Points
              </p>
              <p className="text-3xl font-bold text-warning">847</p>
            </div>
            <Trophy className="h-12 w-12 text-warning opacity-20" />
          </div>
          <div className="mt-4">
            <Badge variant="warning" size="sm">
              Rank #3 in team
            </Badge>
          </div>
        </Card>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Pulse Check */}
        <Card className="daily-pulse p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daily Pulse Check
            </h3>
            <Heart className="h-6 w-6 text-red-500" />
          </div>

          {todaysPulse ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-success font-medium">
                  Submitted for today
                </span>
              </div>
              <div className="p-4 bg-success-bg rounded-lg">
                <p className="text-sm text-success-dark">
                  Rating: {todaysPulse.rating}/5
                  {todaysPulse.comment && (
                    <span className="block mt-1 italic">
                      "{todaysPulse.comment}"
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                How are you feeling today? Your feedback helps improve our team
                culture.
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    size="sm"
                    onClick={() => submitPulse(rating)}
                    className="hover:bg-primary hover:text-white"
                  >
                    {rating}
                  </Button>
                ))}
              </div>
              <Link to="/pulse">
                <Button className="w-full">Submit Detailed Pulse Check</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Office Check-in */}
        <Card className="check-in-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Office Check-in
            </h3>
            <Camera className="h-6 w-6 text-blue-500" />
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Verify your office presence with a photo check-in and earn points!
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Office Check-in
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Remote Day
              </Button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Office check-ins: +10 points | Remote days: +5 points
            </div>
          </div>
        </Card>
      </div>

      {/* Team Overview (for managers) */}
      {(user?.role === "manager" || user?.role === "hr") && teamStats && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Team Overview
            </h3>
            <Users className="h-6 w-6 text-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {teamStats.totalResponses}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pulse Responses
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">
                {teamStats.averageRating?.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Rating
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">
                {Math.round(teamStats.responseRate * 100)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Response Rate
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link to="/analytics">
              <Button variant="outline" className="w-full">
                View Detailed Analytics
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/schedule">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Schedule</span>
            </Button>
          </Link>
          <Link to="/teams">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col items-center gap-2"
            >
              <Users className="h-5 w-5" />
              <span className="text-sm">Team</span>
            </Button>
          </Link>
          <Link to="/rewards">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col items-center gap-2"
            >
              <Trophy className="h-5 w-5" />
              <span className="text-sm">Rewards</span>
            </Button>
          </Link>
          <Link to="/profile">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col items-center gap-2"
            >
              <Building className="h-5 w-5" />
              <span className="text-sm">Profile</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
