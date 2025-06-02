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
  return (
    
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
    
  );
}

export default Dashboard;