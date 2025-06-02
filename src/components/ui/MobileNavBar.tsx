import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  Award,
  Menu,
  Settings,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface MobileNavBarProps {
  onMenuClick: () => void;
}

export default function MobileNavBar({ onMenuClick }: MobileNavBarProps) {
  const { user } = useAuth();
  // Only show the mobile navigation bar on screens smaller than lg
  // We'll handle this with a combination of CSS and a media query check
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check initially
    checkMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-2 z-40 lg:hidden"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, type: "spring" }}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <nav className="flex justify-around items-center">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `
            flex flex-col items-center justify-center p-2 rounded-lg
            ${
              isActive
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          `}
          aria-label="Dashboard"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/schedule"
          className={({ isActive }) => `
            flex flex-col items-center justify-center p-2 rounded-lg
            ${
              isActive
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          `}
          aria-label="Schedule"
        >
          <Calendar className="h-6 w-6" />
          <span className="text-xs mt-1">Schedule</span>
        </NavLink>

        <NavLink
          to="/teams"
          className={({ isActive }) => `
            flex flex-col items-center justify-center p-2 rounded-lg
            ${
              isActive
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          `}
          aria-label="Teams"
        >
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Teams</span>
        </NavLink>

        <NavLink
          to="/rewards"
          className={({ isActive }) => `
            flex flex-col items-center justify-center p-2 rounded-lg
            ${
              isActive
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          `}
          aria-label="Rewards"
        >
          <Award className="h-6 w-6" />
          <span className="text-xs mt-1">Rewards</span>
        </NavLink>

        <NavLink
          to={user ? `/profile/${user.id}` : "/settings"}
          className={({ isActive }) => `
            flex flex-col items-center justify-center p-2 rounded-lg
            ${
              isActive
                ? "text-primary"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }
          `}
          aria-label="Profile"
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>

        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          aria-label="More options"
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">More</span>
        </button>
      </nav>
    </motion.div>
  );
}
