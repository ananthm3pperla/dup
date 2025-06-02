
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LoadingState, Button, Card, Badge } from "../components/ui";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  TrendingUp,
  Award,
  Bell,
  Plus,
  MapPin,
  Clock,
} from "lucide-react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import KeyMetrics from "../components/dashboard/KeyMetrics";
import DailyPulse from "../components/dashboard/DailyPulse";
import TeamSchedule from "../components/dashboard/TeamSchedule";
import TodaySchedule from "../components/dashboard/TodaySchedule";
import AIInsights from "../components/dashboard/AIInsights";
import CheckInCard from "../components/dashboard/CheckInCard";
import RecentAchievements from "../components/dashboard/RecentAchievements";
import { isDemoMode, getDemoUser } from "@/lib/demo";
import { userAPI, teamAPI, analyticsAPI } from "@/lib/api";

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader firstName={user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <KeyMetrics />
          <DailyPulse />
          <AIInsights />
          <TeamSchedule />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <CheckInCard />
          <TodaySchedule />
          <RecentAchievements />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
